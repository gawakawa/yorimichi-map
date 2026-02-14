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
      lib,
      pkgs,
      ...
    }:
    let
      inherit (inputs'.nix2container.packages) nix2container;
    in
    {
      ciPackages = [
        pkgs.uv
      ];

      packages = {
        ci = pkgs.buildEnv {
          name = "ci";
          paths = config.ciPackages ++ [ config.devVirtualenv ];
        };

        container = nix2container.buildImage {
          name = "yorimichi-map-backend";
          copyToRoot = pkgs.buildEnv {
            name = "root";
            paths = [
              config.prodVirtualenv
              config.backendSrc
            ];
            pathsToLink = [ "/" ];
          };
          config = {
            Cmd = [
              "${lib.getExe' config.prodVirtualenv "gunicorn"}"
              "--bind"
              "0.0.0.0:8000"
              "--workers"
              "2"
              "yorimichi_map_backend.wsgi"
            ];
            WorkingDir = "${config.backendSrc}";
            ExposedPorts = {
              "8000/tcp" = { };
            };
          };
        };
      };
    };
}
