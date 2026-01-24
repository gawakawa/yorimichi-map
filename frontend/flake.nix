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
          inputs,
          pkgs,
          system,
          ...
        }:
        let
          inherit (inputs.nix2container.packages.${system}) nix2container;

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
        in
        {
          packages = {
            ci = pkgs.buildEnv {
              name = "ci";
              paths = ciPackages;
            };

            container = nix2container.buildImage {
              name = "yorimichi-map-frontend";
              config = {
                entrypoint = [ "${pkgs.hello}/bin/hello" ];
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
