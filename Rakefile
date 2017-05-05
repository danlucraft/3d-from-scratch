task :build do
  rm_rf "dist"
  mkdir_p "dist"
  sh "cp src/day1.js dist/day1.js"
  sh "cp src/day2.js dist/day2.js"
  sh "tsc src/day3/main.ts --outFile dist/day3.js"
  sh "tsc src/day4/main.ts --outFile dist/day4.js"
end