# Path to NuGet.exe (assumes nuget.exe is in your PATH, or in the same directory as this script)
$nugetPath = "nuget.exe"

# Script's directory paths
$rootLocation = "..\..\"
$packagesDir = Join-Path -Path $PSScriptRoot -ChildPath $rootLocation"KinectBodyTrackingPackages"
$packagesConfigPath = Join-Path -Path $PSScriptRoot -ChildPath "packages.config"

Write-Host "Kinect body tracking packages config path: $packagesConfigPath"
Write-Host "Downloading Kinect body tracking packages to folder: $packagesDir"

# Restore packages using NuGet CLI
& $nugetPath restore $packagesConfigPath -PackagesDirectory $packagesDir

Write-Host "Kinect body tracking dependency restore complete"

# Call batch file to move the DLLs to the correct location
Write-Host "Moving dependencies to the correct location..."
& "$PSScriptRoot\MoveLibraryFiles.bat"
