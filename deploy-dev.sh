rsync -avhzL \
    --no-perms --no-owner --no-group \
    --exclude .git \
    --filter=":- .gitignore" \
    . root@165.232.172.190:/home/eos-v2

ssh root@165.232.172.190 'pm2 restart eos-v2'