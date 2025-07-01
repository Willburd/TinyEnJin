@echo on
cd %1
call %appdata%\npm\tsc -p .
npx webpack
cd ..