$ErrorActionPreference = "Stop"

# ¿La consola está elevada (Administrador)?
$windowsIdentity = [Security.Principal.WindowsIdentity]::GetCurrent()
$windowsPrincipal = New-Object Security.Principal.WindowsPrincipal($windowsIdentity)
$isAdmin = $windowsPrincipal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

# ¿Modo de Programador activado?
$devVal = 0
try {
  $props = Get-ItemProperty -Path 'HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\AppModelUnlock' -Name 'AllowDevelopmentWithoutDevLicense' -ErrorAction Stop
  if ($props -and $props.AllowDevelopmentWithoutDevLicense -eq 1) { $devVal = 1 }
} catch {
  $devVal = 0
}

if (-not $isAdmin -and $devVal -ne 1) {
  Write-Error "Developer Mode is not enabled AND this shell is not elevated (Admin).
Enable Developer Mode (Settings > Privacy & security > For developers) OR re-run the terminal as Administrator. Aborting."
  exit 1
} else {
  Write-Host ("Preflight OK  |  Admin={0}  DevMode={1}" -f $isAdmin, $devVal)
}
