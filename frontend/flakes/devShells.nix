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
      mcpConfig =
        inputs.mcp-servers-nix.lib.mkConfig
          (import inputs.mcp-servers-nix.inputs.nixpkgs {
            inherit system;
          })
          {
            programs.nixos.enable = true;
            settings.servers.chrome-devtools = {
              command = "${pkgs.lib.getExe' pkgs.nodejs_24 "npx"}";
              args = [
                "-y"
                "chrome-devtools-mcp@latest"
                "--executablePath"
                "${pkgs.lib.getExe pkgs.ungoogled-chromium}"
              ];
              env = {
                PATH = "${pkgs.nodejs_24}/bin:${pkgs.bash}/bin";
              };
            };
          };

      devPackages =
        config.ciPackages
        ++ config.pre-commit.settings.enabledPackages
        ++ (with pkgs; [
          # Additional development tools can be added here
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
