ssh -i ~/.ssh/k8s-master-key \
-o StrictHostKeyChecking=no \
-o UserKnownHostsFile=/dev/null \
master@20.255.57.25 \
kubeadm token create --print-join-command
