{ flake-parts-lib, ... }:
{
  options.perSystem = flake-parts-lib.mkPerSystemOption (
    { lib, ... }:
    {
      options.ciPackages = lib.mkOption {
        type = lib.types.listOf lib.types.package;
        default = [ ];
        description = "Packages for CI environment";
      };
    }
  );

  config.perSystem =
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
        src = ./..;

        npmDeps = importNpmLock { npmRoot = ./..; };
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
                prependConfig = "user root;";
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
                  root = "/";
                  locations."/".tryFiles = "$uri $uri/ /index.html";
                };
              };
            }
          ];
        }).config.environment.etc."nginx/nginx.conf".source;
    in
    {
      ciPackages = with pkgs; [
        pnpm
        nodejs_24
      ];

      packages = {
        ci = pkgs.buildEnv {
          name = "ci";
          paths = config.ciPackages;
        };

        inherit frontend;

        container = nix2container.buildImage {
          name = "yorimichi-map-frontend";
          copyToRoot = pkgs.buildEnv {
            name = "root";
            paths = [
              frontend
              pkgs.nginx
              (pkgs.runCommand "container-init" { } ''
                mkdir -p $out/var/log/nginx $out/var/cache/nginx $out/tmp $out/etc $out/run/nginx
                echo "root:x:0:0:root:/root:/bin/sh" > $out/etc/passwd
                echo "root:x:0:" > $out/etc/group
                cat > $out/etc/nsswitch.conf << 'EOF'
                passwd: files
                group: files
                hosts: files dns
                EOF
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
    };
}
