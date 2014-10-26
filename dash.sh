#!/bin/sh
 
git filter-branch --env-filter '
 
an="$GIT_AUTHOR_NAME"
am="$GIT_AUTHOR_EMAIL"
cn="$GIT_COMMITTER_NAME"
cm="$GIT_COMMITTER_EMAIL"
 
if [ "$GIT_COMMITTER_EMAIL" != "lizouzt@gmail.com" ]
then
    cm="lizouzt@gmail.com"
fi

if [ "$GIT_AUTHOR_EMAIL" = "lizouzt@MININT-Q6LAT18.hz.ali.com" ]
then
    an="lizouzt"
    am="lizouzt@alipapa-inc.com"
fi
 
export GIT_AUTHOR_NAME="$an"
export GIT_AUTHOR_EMAIL="$am"
export GIT_COMMITTER_NAME="$cn"
export GIT_COMMITTER_EMAIL="$cm"
'
