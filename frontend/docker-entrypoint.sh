#!/bin/sh
set -eu

API_BASE_URL="${API_BASE_URL:-https://backend-production-04ab.up.railway.app}"
PORT="${PORT:-8080}"

cat >/usr/share/nginx/html/config.js <<EOF
window.__FLOWBOARD_CONFIG__ = {
  apiBase: "${API_BASE_URL}"
};
EOF

cat >/etc/nginx/conf.d/default.conf <<EOF
server {
  listen ${PORT};
  server_name _;

  root /usr/share/nginx/html;
  index index.html;

  location / {
      try_files \$uri \$uri/ /index.html;
  }
}
EOF

exec nginx -g 'daemon off;'