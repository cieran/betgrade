@ECHO OFF
SET /p comment=Comment:
git add --all
git commit -a -m "%comment%"
git push
