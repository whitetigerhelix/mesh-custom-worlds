# Root path of Unity project, relative to this script
$rootLocation = "..\..\"

# Define the paths and files to be removed, relative to the project root path
$paths = @(
    "Assets\Plugins\KinectBodyTracking\",
    "Assets\Plugins\KinectBodyTracking.meta",
    "KinectBodyTrackingPackages\",
    "directml.dll",
    "dnn_model_2_0_op11.onnx",
    "onnxruntime.dll",
    "onnxruntime_providers_cuda.dll",
    "onnxruntime_providers_shared.dll",
    "onnxruntime_providers_tensorrt.dll"
)

Write-Output "Removing Kinect Body Tracking library files..."

# Iterate through each path and remove it
foreach ($path in $paths)
{
    $fullPath = Join-Path -Path $PSScriptRoot -ChildPath $rootLocation$path

    if (Test-Path -Path $fullPath)
    {
        if ((Get-Item $fullPath) -is [System.IO.DirectoryInfo])
        {
            # Item is a directory, remove it recursively
            Remove-Item -Path $fullPath -Recurse -Force
        }
        else
        {
            # Item is a file, remove it
            Remove-Item -Path $fullPath -Force
        }
        Write-Output "Removed: $fullPath"
    }
    else
    {
        Write-Output "Not found: $fullPath"
    }
}

Write-Output "Done removing library files"
