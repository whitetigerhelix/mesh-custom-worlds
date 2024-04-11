@echo off

setLocal

REM Set locations for everything
echo Batch file directory: %~dp0
set ROOT_LOCATION=%~dp0..\..\
echo ROOT_LOCATION: %ROOT_LOCATION%

set NUGET_PACKAGES_LOCATION=%ROOT_LOCATION%KinectBodyTrackingPackages\

set PLUGIN_LOCATION=%ROOT_LOCATION%Assets\Plugins\KinectBodyTracking
if not exist "%PLUGIN_LOCATION%" mkdir "%PLUGIN_LOCATION%"

set PACKAGE_BTSDK=Microsoft.Azure.Kinect.BodyTracking.1.1.2
set PACKAGE_ONNXRUNTIME=Microsoft.Azure.Kinect.BodyTracking.ONNXRuntime.1.10.0
set PACKAGE_SENSOR_SDK=Microsoft.Azure.Kinect.Sensor.1.4.1
set PACKAGE_SYSTEM_BUFFERS=System.Buffers.4.4.0
set PACKAGE_SYSTEM_MEMORY=System.Memory.4.5.3
set PACKAGE_SYSTEM_RUNTIME_SERVICES=System.Runtime.CompilerServices.Unsafe.4.5.2
set PACKAGE_SYSTEM_REFLECTION=System.Reflection.Emit.Lightweight.4.6.0

REM Change to nuget packages directory to avoid long paths
pushd %NUGET_PACKAGES_LOCATION%

REM Copy all the necessary files to all the required places
echo Copying files...

copy %PACKAGE_SENSOR_SDK%\lib\netstandard2.0\Microsoft.Azure.Kinect.Sensor.dll "%PLUGIN_LOCATION%"
copy %PACKAGE_SENSOR_SDK%\lib\netstandard2.0\Microsoft.Azure.Kinect.Sensor.pdb "%PLUGIN_LOCATION%"
copy %PACKAGE_SENSOR_SDK%\lib\netstandard2.0\Microsoft.Azure.Kinect.Sensor.deps.json "%PLUGIN_LOCATION%"
copy %PACKAGE_SENSOR_SDK%\lib\netstandard2.0\Microsoft.Azure.Kinect.Sensor.xml "%PLUGIN_LOCATION%"
copy %PACKAGE_SENSOR_SDK%\lib\native\amd64\release\depthengine_2_0.dll "%PLUGIN_LOCATION%"
copy %PACKAGE_SENSOR_SDK%\lib\native\amd64\release\k4a.dll "%PLUGIN_LOCATION%"
copy %PACKAGE_SENSOR_SDK%\lib\native\amd64\release\k4arecord.dll "%PLUGIN_LOCATION%"
copy %PACKAGE_SYSTEM_BUFFERS%\lib\netstandard2.0\System.Buffers.dll "%PLUGIN_LOCATION%"
copy %PACKAGE_SYSTEM_MEMORY%\lib\netstandard2.0\System.Memory.dll "%PLUGIN_LOCATION%"
copy %PACKAGE_SYSTEM_RUNTIME_SERVICES%\lib\netstandard2.0\System.Runtime.CompilerServices.Unsafe.dll "%PLUGIN_LOCATION%"
copy %PACKAGE_SYSTEM_REFLECTION%\lib\netstandard2.0\System.Reflection.Emit.Lightweight.dll "%PLUGIN_LOCATION%"

copy %PACKAGE_BTSDK%\lib\netstandard2.0\Microsoft.Azure.Kinect.BodyTracking.dll "%PLUGIN_LOCATION%"
copy %PACKAGE_BTSDK%\lib\netstandard2.0\Microsoft.Azure.Kinect.BodyTracking.pdb "%PLUGIN_LOCATION%"
copy %PACKAGE_BTSDK%\lib\netstandard2.0\Microsoft.Azure.Kinect.BodyTracking.deps.json "%PLUGIN_LOCATION%"
copy %PACKAGE_BTSDK%\lib\netstandard2.0\Microsoft.Azure.Kinect.BodyTracking.xml "%PLUGIN_LOCATION%"
copy %PACKAGE_BTSDK%\lib\native\amd64\release\k4abt.dll "%PLUGIN_LOCATION%"
copy %PACKAGE_ONNXRUNTIME%\lib\native\amd64\release\directml.dll "%PLUGIN_LOCATION%"
copy %PACKAGE_ONNXRUNTIME%\lib\native\amd64\release\onnxruntime.dll "%PLUGIN_LOCATION%"
copy %PACKAGE_ONNXRUNTIME%\lib\native\amd64\release\onnxruntime_providers_cuda.dll "%PLUGIN_LOCATION%"
copy %PACKAGE_ONNXRUNTIME%\lib\native\amd64\release\onnxruntime_providers_shared.dll "%PLUGIN_LOCATION%"
copy %PACKAGE_ONNXRUNTIME%\lib\native\amd64\release\onnxruntime_providers_tensorrt.dll "%PLUGIN_LOCATION%"

copy %PACKAGE_BTSDK%\content\dnn_model_2_0_op11.onnx "%ROOT_LOCATION%"
copy %PACKAGE_ONNXRUNTIME%\lib\native\amd64\release\directml.dll "%ROOT_LOCATION%"
copy %PACKAGE_ONNXRUNTIME%\lib\native\amd64\release\onnxruntime.dll "%ROOT_LOCATION%"
copy %PACKAGE_ONNXRUNTIME%\lib\native\amd64\release\onnxruntime_providers_cuda.dll "%ROOT_LOCATION%"
copy %PACKAGE_ONNXRUNTIME%\lib\native\amd64\release\onnxruntime_providers_shared.dll "%ROOT_LOCATION%"
copy %PACKAGE_ONNXRUNTIME%\lib\native\amd64\release\onnxruntime_providers_tensorrt.dll "%ROOT_LOCATION%"

echo Done copying files

popd

endLocal
