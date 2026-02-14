{ inputs, ... }:
{
  perSystem =
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

      devPackages =
        config.ciPackages
        ++ config.pre-commit.settings.enabledPackages
        ++ (with pkgs; [
          curl
          gh
          google-cloud-sdk
          jq
          podman
          tree
        ]);
    in
    {
      devShells.default = pkgs.mkShell {
        buildInputs = devPackages;

        shellHook = ''
          ${config.pre-commit.shellHook}
          cat ${mcpConfig} > .mcp.json
          echo "Generated .mcp.json"
        '';
      };
    };
}
