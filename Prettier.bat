@echo on
cd %1
npx prettier . --write
cd ..