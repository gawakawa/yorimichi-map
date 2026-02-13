{ flake-parts-lib, inputs, ... }:
{
  options.perSystem = flake-parts-lib.mkPerSystemOption (
    { lib, ... }:
    {
      options.ciPackages = lib.mkOption {
        type = lib.types.listOf lib.types.package;
        default = [ ];
        description = "Packages for CI environment";
      };
    }
  );

  config.perSystem =
    {
      config,
      pkgs,
      system,
      ...
    }:
    let
      mcpConfig = inputs.mcp-servers-nix.lib.mkConfig (import inputs.mcp-servers-nix.inputs.nixpkgs {
        inherit system;
      }) { programs.nixos.enable = true; };
    in
    {
      packages = {
        ci = pkgs.buildEnv {
          name = "ci";
          paths = config.ciPackages;
        };

        mcp-config = mcpConfig;
      };
    };
}
