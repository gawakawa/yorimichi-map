_: {
  perSystem =
    { pkgs, ... }:
    let
      oxfmtConfig = pkgs.writeText "oxfmtrc.json" (
        builtins.toJSON {
          useTabs = true;
          singleQuote = true;
        }
      );
    in
    {
      treefmt = {
        programs = {
          oxfmt = {
            enable = true;
            includes = [
              "*.ts"
              "*.tsx"
              "*.js"
              "*.jsx"
            ];
          };
        };
        settings.formatter.oxfmt.options = [
          "--config"
          (toString oxfmtConfig)
        ];
      };
    };
}
