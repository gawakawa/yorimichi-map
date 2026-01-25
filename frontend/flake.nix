{
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-parts.url = "github:hercules-ci/flake-parts";
    treefmt-nix.url = "github:numtide/treefmt-nix";
    git-hooks-nix = {
      url = "github:cachix/git-hooks.nix";
      inputs.nixpkgs.follows = "nixpkgs";
    };
    nix2container = {
      url = "github:nlewo/nix2container";
      inputs.nixpkgs.follows = "nixpkgs";
    };
    mcp-servers-nix.url = "github:natsukium/mcp-servers-nix";
  };

  outputs =
    inputs:
    inputs.flake-parts.lib.mkFlake { inherit inputs; } {
      systems = [
        "x86_64-linux"
        "aarch64-darwin"
      ];

      imports = [
        inputs.treefmt-nix.flakeModule
        inputs.git-hooks-nix.flakeModule
      ];

      perSystem =
        {
          config,
          inputs',
          pkgs,
          system,
          ...
        }:
        let
          inherit (inputs'.nix2container.packages) nix2container;
          inherit (pkgs) buildNpmPackage importNpmLock;

          frontend = buildNpmPackage {
            pname = "yorimichi-map-frontend";
            version = "0.1.0";
            src = ./.;

            npmDeps = importNpmLock { npmRoot = ./.; };
            inherit (importNpmLock) npmConfigHook;

            installPhase = ''
              runHook preInstall
              cp -r dist $out
              runHook postInstall
            '';
          };

          nginxConf =
            (import (pkgs.path + "/nixos/lib/eval-config.nix") {
              inherit system;
              modules = [
                {
                  nixpkgs.hostPlatform = system;
                  system.stateVersion = "24.11";
                  services.nginx = {
                    enable = true;
                    enableReload = true;
                    user = "root";
                    group = "root";
                    appendHttpConfig = ''
                      access_log /dev/stdout combined;
                    '';
                    virtualHosts."localhost" = {
                      listen = [
                        {
                          addr = "0.0.0.0";
                          port = 8080;
                        }
                      ];
                      root = "/dist";
                      locations."/".tryFiles = "$uri $uri/ /index.html";
                    };
                  };
                }
              ];
            }).config.environment.etc."nginx/nginx.conf".source;

          ciPackages = with pkgs; [
            pnpm
            nodejs_24
          ];

          devPackages =
            ciPackages
            ++ config.pre-commit.settings.enabledPackages
            ++ (with pkgs; [
              # Additional development tools can be added here
            ]);

          oxfmtConfig = pkgs.writeText "oxfmtrc.json" (
            builtins.toJSON {
              useTabs = true;
              singleQuote = true;
            }
          );

          mcpConfig =
            inputs.mcp-servers-nix.lib.mkConfig
              (import inputs.mcp-servers-nix.inputs.nixpkgs {
                inherit system;
              })
              {
                programs.nixos.enable = true;
                settings.servers.chrome-devtools = {
                  command = "${pkgs.lib.getExe' pkgs.nodejs_24 "npx"}";
                  args = [
                    "-y"
                    "chrome-devtools-mcp@latest"
                    "--executablePath"
                    "${pkgs.lib.getExe pkgs.ungoogled-chromium}"
                  ];
                  env = {
                    PATH = "${pkgs.nodejs_24}/bin:${pkgs.bash}/bin";
                  };
                };
              };
        in
        {
          packages = {
            ci = pkgs.buildEnv {
              name = "ci";
              paths = ciPackages;
            };

            inherit frontend;

            mcp-config = mcpConfig;

            container = nix2container.buildImage {
              name = "yorimichi-map-frontend";
              copyToRoot = pkgs.buildEnv {
                name = "root";
                paths = [
                  frontend
                  pkgs.nginx
                  (pkgs.runCommand "container-init" { } ''
                    mkdir -p $out/var/log/nginx $out/var/cache/nginx $out/tmp $out/etc
                    echo "root:x:0:0:root:/root:/bin/sh" > $out/etc/passwd
                    echo "root:x:0:" > $out/etc/group
                  '')
                ];
                pathsToLink = [ "/" ];
              };
              config = {
                Cmd = [
                  "${pkgs.nginx}/bin/nginx"
                  "-e"
                  "/dev/stderr"
                  "-c"
                  nginxConf
                ];
                ExposedPorts = {
                  "8080/tcp" = { };
                };
              };
            };
          };

          pre-commit.settings.hooks = {
            treefmt.enable = true;
            oxlint = {
              enable = true;
              name = "oxlint";
              entry = "${pkgs.oxlint}/bin/oxlint --type-aware";
              files = "\\.(ts|tsx|js|jsx)$";
              pass_filenames = false;
            };
          };

          devShells.default = pkgs.mkShell {
            buildInputs = devPackages;

            shellHook = ''
              ${config.pre-commit.shellHook}
              cat ${mcpConfig} > .mcp.json
              echo "Generated .mcp.json"
            '';
          };

          treefmt = {
            programs = {
              oxfmt = {
                enable = true;
                includes = [
                  "*.ts"
                  "*.tsx"
                  "*.js"
                  "*.jsx"
                ];
              };
            };
            settings.formatter.oxfmt.options = [
              "--config"
              (toString oxfmtConfig)
            ];
          };
        };
    };
}
