rsync -avhzL \
    --no-perms --no-owner --no-group \
    --exclude .git \
    --filter=":- .gitignore" \
    . root@165.22.55.213:/home/eos-v2

