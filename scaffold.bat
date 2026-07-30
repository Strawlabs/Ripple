cd c:\Users\sruthi\Desktop
npx -y create-next-app@latest ripple-temp --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm
xcopy /E /I /H /Y ripple-temp\* Ripple\
rmdir /S /Q ripple-temp
