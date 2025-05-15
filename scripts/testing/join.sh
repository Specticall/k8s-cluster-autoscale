kubeadm join 20.255.57.25:6443 --token uhj2t8.5t8t7u92qm9a28ji --discovery-token-ca-cert-hash sha256:dde0700e14906101f7dfc3d8309994c9c2ea006f8559ee32616babe72a7a8127

ssh \
  -i ~/.ssh/k8s-key \
  -A \
  -o StrictHostKeyChecking=no \
  -o UserKnownHostsFile=/dev/null \
  -o "ProxyCommand=ssh -i ~/.ssh/k8s-key -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -W %h:%p bastion@23.102.247.229" \
  -o StrictHostKeyChecking=no \
  -o UserKnownHostsFile=/dev/null \
  worker@10.10.0.4 \
