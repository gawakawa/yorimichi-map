{ ... }:
{
  perSystem =
    {
      config,
      pkgs,
      ...
    }:
    let
      devPackages =
        config.ciPackages
        ++ config.pre-commit.settings.enabledPackages
        ++ (with pkgs; [
          # Additional development tools can be added here
        ]);
    in
    {
      devShells.default = pkgs.mkShell {
        buildInputs = devPackages;

        shellHook = ''
          ${config.pre-commit.shellHook}
        '';
      };
    };
}
