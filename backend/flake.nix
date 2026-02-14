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
    pyproject-nix = {
      url = "github:pyproject-nix/pyproject.nix";
      inputs.nixpkgs.follows = "nixpkgs";
    };
    uv2nix = {
      url = "github:pyproject-nix/uv2nix";
      inputs = {
        pyproject-nix.follows = "pyproject-nix";
        nixpkgs.follows = "nixpkgs";
      };
    };
    pyproject-build-systems = {
      url = "github:pyproject-nix/build-system-pkgs";
      inputs = {
        pyproject-nix.follows = "pyproject-nix";
        uv2nix.follows = "uv2nix";
        nixpkgs.follows = "nixpkgs";
      };
    };
  };

  outputs =
    inputs:
    inputs.flake-parts.lib.mkFlake { inherit inputs; } {
      systems = [
        "x86_64-linux"
        "aarch64-darwin"
        "x86_64-darwin"
      ];

      imports = [
        inputs.treefmt-nix.flakeModule
        inputs.git-hooks-nix.flakeModule
      ];

      perSystem =
        {
          config,
          inputs',
          lib,
          pkgs,
          ...
        }:
        let
          inherit (inputs'.nix2container.packages) nix2container;
          inherit (inputs.uv2nix.lib) workspace;
          inherit (inputs.pyproject-build-systems.overlays) wheel;

          python = pkgs.python312;

          workspaceConfig = workspace.loadWorkspace { workspaceRoot = ./.; };

          overlay = workspaceConfig.mkPyprojectOverlay {
            sourcePreference = "wheel";
          };

          editableOverlay = workspaceConfig.mkEditablePyprojectOverlay {
            root = "$REPO_ROOT";
          };

          pythonSet =
            (pkgs.callPackage inputs.pyproject-nix.build.packages {
              inherit python;
            }).overrideScope
              (
                lib.composeManyExtensions [
                  wheel
                  overlay
                ]
              );

          editablePythonSet = pythonSet.overrideScope editableOverlay;

          devVirtualenv = editablePythonSet.mkVirtualEnv "yorimichi-map-backend-dev-env" workspaceConfig.deps.all;

          prodVirtualenv = pythonSet.mkVirtualEnv "yorimichi-map-backend-env" workspaceConfig.deps.default;

          backendSrc = pkgs.stdenv.mkDerivation {
            name = "yorimichi-map-backend-src";
            src = lib.fileset.toSource {
              root = ./.;
              fileset = lib.fileset.unions [
                ./yorimichi_map_backend
                ./manage.py
              ];
            };
            phases = [ "installPhase" ];
            installPhase = ''
              mkdir -p $out
              cp -r $src/* $out/
            '';
          };

          ciPackages = [
            pkgs.uv
          ];

          devPackages = ciPackages ++ config.pre-commit.settings.enabledPackages;
        in
        {
          packages = {
            ci = pkgs.buildEnv {
              name = "ci";
              paths = ciPackages ++ [ devVirtualenv ];
            };

            container = nix2container.buildImage {
              name = "yorimichi-map-backend";
              copyToRoot = pkgs.buildEnv {
                name = "root";
                paths = [
                  prodVirtualenv
                  backendSrc
                ];
                pathsToLink = [ "/" ];
              };
              config = {
                Cmd = [
                  "${lib.getExe' prodVirtualenv "gunicorn"}"
                  "--bind"
                  "0.0.0.0:8000"
                  "--workers"
                  "2"
                  "yorimichi_map_backend.wsgi"
                ];
                WorkingDir = "${backendSrc}";
                ExposedPorts = {
                  "8000/tcp" = { };
                };
              };
            };
          };

          pre-commit.settings.hooks = {
            treefmt.enable = true;
            ruff.enable = true;
            ty = {
              enable = pkgs.stdenv.isLinux;
              name = "ty";
              entry = "${pkgs.ty}/bin/ty check --project backend";
              files = "^backend/.*\\.py$";
              pass_filenames = false;
            };
          };

          devShells.default = pkgs.mkShell {
            packages = [
              devVirtualenv
            ]
            ++ devPackages;

            env = {
              UV_NO_SYNC = "1";
              UV_PYTHON = python.interpreter;
              UV_PYTHON_DOWNLOADS = "never";
            };

            shellHook = ''
              ${config.pre-commit.shellHook}
              unset PYTHONPATH
              export REPO_ROOT=$(git rev-parse --show-toplevel)
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
