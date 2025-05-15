kubectl create deployment cpu-hog `
  --image=polinux/stress `
  --replicas=3 `
  -- /bin/sh -c "stress --cpu 8 --timeout 300"
