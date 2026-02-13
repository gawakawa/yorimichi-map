_: {
  perSystem =
    { pkgs, ... }:
    {
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
    };
}
