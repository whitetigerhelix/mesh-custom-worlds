# A function that takes an "environment" param (local, dogfood) and ensures that the ../certs/<environment> directory  
# exists then calls the mkcert create-ca and create-cert commands to create the ca.key, ca.crt, key.pem, and cert.pem files 
# This enables users to run across the different environments without having to recreate the certs each time 
 
param ( 
  # optional force command, usage -force 
  [switch]$force = $false 
) 
 
# Generate new certs if they have not yet been created 
$certsPath = Join-Path -Path $PSScriptRoot -ChildPath "..\certs\local" 
 
# the certsPath should have two files, ca.crt and ca.key 
# First check to see if the folder exists, then ensure the files exist. If they do, exit early 
$directoryExists = Test-Path $certsPath 
if ($directoryExists) { 
  $caCrtExists = Test-Path (Join-Path -Path $certsPath -ChildPath "ca.crt") 
  $caKeyExists = Test-Path (Join-Path -Path $certsPath -ChildPath "ca.key") 
  if ($caCrtExists -and $caKeyExists -and -not $force) { 
    Write-Host "Certs have already been generated, bypassing cert initialization logic" 
    exit 
  } 
} 
 
# If the directory exists, but the files do not, delete the directory to start fresh 
if ($directoryExists) { 
  Remove-Item -Path $certsPath -Recurse -Force 
} 
 
# Now - Create the certs 
New-Item -ItemType Directory -Path $certsPath 
 
# Navigate to certs folder 
Push-Location -Path $certsPath 
 
# Create the ca and cert files 
npx mkcert create-ca --organization "Teams Immersive Localhost + $environment" --state "Washington" --locality "Redmond" --validity 365000 
 
# Create the cert file 
npx mkcert create-cert --ca-key ca.key --ca-cert ca.crt --validity 365000 --domains "localhost" --key key.pem --cert cert.pem 
 
# Import the certificate to the Trusted Root Certification Authorities for the LOCAL USER. 
certutil -addstore -user -f -v root "ca.crt" 
 
# Go back to the original path 
Pop-Location 
