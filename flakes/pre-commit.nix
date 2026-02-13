_: {
  perSystem = _: {
    pre-commit.settings.hooks = {
      treefmt.enable = true;
      statix.enable = true;
      deadnix.enable = true;
      actionlint.enable = true;
      markdownlint = {
        enable = true;
        settings = {
          configuration = {
            MD013 = {
              line_length = 120;
            };
            MD041 = {
              front_matter_title = ".";
            };
          };
        };
      };
    };
  };
}
