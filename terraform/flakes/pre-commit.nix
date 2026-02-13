_: {
  perSystem =
    { pkgs, ... }:
    {
      pre-commit.settings.hooks = {
        treefmt.enable = true;
        tflint.enable = true;
        terraform-docs = {
          enable = true;
          entry = "${pkgs.terraform-docs}/bin/terraform-docs markdown table --output-file README.md --output-mode inject terraform";
          files = "^terraform/.*\\.tf$";
          pass_filenames = false;
        };
      };
    };
}
