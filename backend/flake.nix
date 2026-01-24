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
            python312
            uv
          ];

          devPackages =
            ciPackages
            ++ config.pre-commit.settings.enabledPackages
            ++ (with pkgs; [
              # Additional development tools can be added here
            ]);
        in
        {
          packages = {
            ci = pkgs.buildEnv {
              name = "ci";
              paths = ciPackages;
            };

            container = nix2container.buildImage {
              name = "yorimichi-map-backend";
              config = {
                entrypoint = [ "${pkgs.hello}/bin/hello" ];
              };
            };
          };

          pre-commit.settings.hooks = {
            treefmt.enable = true;
            ruff.enable = true;
            ty = {
              enable = true;
              name = "ty";
              entry = "${pkgs.ty}/bin/ty check --project backend";
              files = "^backend/.*\\.py$";
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
              ruff-format = {
                enable = true;
                includes = [ "*.py" ];
              };
            };
          };
        };
    };
}
