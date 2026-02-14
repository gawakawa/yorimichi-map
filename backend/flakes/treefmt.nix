_: {
  perSystem = _: {
    treefmt = {
      programs = {
        ruff-format = {
          enable = true;
          includes = [ "*.py" ];
        };
      };
    };
  };
}
