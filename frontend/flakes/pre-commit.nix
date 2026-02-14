_: {
  perSystem =
    { pkgs, ... }:
    {
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
    };
}
