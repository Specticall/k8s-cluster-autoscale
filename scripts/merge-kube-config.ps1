$ssh_key_path = '../core/secret/k8s-master-1-key.pem'
$username = 'master'
$ip = '20.255.57.25'

Write-Host "Copying config from master node..."
scp -i $ssh_key_path "${username}@${ip}:~/.kube/config" "${HOME}/master-kubeconfig.yaml"

Write-Host "Applying config..."
$env:KUBECONFIG = "$HOME\.kube\config;$HOME\master-kubeconfig.yaml"
kubectl config view --flatten > $HOME\.kube\config.merged
Move-Item $HOME\.kube\config.merged $HOME\.kube\config -Force

Write-Host "Kube config merged"
