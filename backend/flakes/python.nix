{ flake-parts-lib, inputs, ... }:
{
  options.perSystem = flake-parts-lib.mkPerSystemOption (
    { lib, pkgs, ... }:
    let
      inherit (inputs.uv2nix.lib) workspace;
      inherit (inputs.pyproject-build-systems.overlays) wheel;

      python = pkgs.python312;

      workspaceConfig = workspace.loadWorkspace { workspaceRoot = ./..; };

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
    in
    {
      options = {
        python = lib.mkOption {
          type = lib.types.package;
          default = python;
          description = "Python interpreter";
        };

        devVirtualenv = lib.mkOption {
          type = lib.types.package;
          default = editablePythonSet.mkVirtualEnv "yorimichi-map-backend-dev-env" workspaceConfig.deps.all;
          description = "Development virtualenv";
        };

        prodVirtualenv = lib.mkOption {
          type = lib.types.package;
          default = pythonSet.mkVirtualEnv "yorimichi-map-backend-env" workspaceConfig.deps.default;
          description = "Production virtualenv";
        };

        backendSrc = lib.mkOption {
          type = lib.types.package;
          default = pkgs.stdenv.mkDerivation {
            name = "yorimichi-map-backend-src";
            src = lib.fileset.toSource {
              root = ./..;
              fileset = lib.fileset.unions [
                ./../yorimichi_map_backend
                ./../manage.py
              ];
            };
            phases = [ "installPhase" ];
            installPhase = ''
              mkdir -p $out
              cp -r $src/* $out/
            '';
          };
          description = "Backend source code";
        };
      };
    }
  );
}
