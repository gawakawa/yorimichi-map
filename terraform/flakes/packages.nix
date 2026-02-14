{ inputs, ... }:
{
  perSystem =
    { system, ... }:
    let
      mcpConfig = inputs.mcp-servers-nix.lib.mkConfig (import inputs.mcp-servers-nix.inputs.nixpkgs {
        inherit system;
      }) { programs.terraform.enable = true; };
    in
    {
      packages = {
        mcp-config = mcpConfig;
      };
    };
}
