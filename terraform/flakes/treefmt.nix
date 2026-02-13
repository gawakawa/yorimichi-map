_: {
  perSystem = _: {
    treefmt = {
      programs = {
        terraform = {
          enable = true;
          includes = [
            "*.tf"
            "*.tfvars"
          ];
        };
      };
    };
  };
}
