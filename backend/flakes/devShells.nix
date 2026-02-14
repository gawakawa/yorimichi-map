_: {
  perSystem =
    { config, pkgs, ... }:
    let
      devPackages = config.ciPackages ++ config.pre-commit.settings.enabledPackages;
    in
    {
      devShells.default = pkgs.mkShell {
        packages = [
          config.devVirtualenv
        ]
        ++ devPackages;

        env = {
          UV_NO_SYNC = "1";
          UV_PYTHON = config.python.interpreter;
          UV_PYTHON_DOWNLOADS = "never";
        };

        shellHook = ''
          ${config.pre-commit.shellHook}
          unset PYTHONPATH
          export REPO_ROOT=$(git rev-parse --show-toplevel)
        '';
      };
    };
}
