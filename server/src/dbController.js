//node.js 환경에선 기본적으로 import문법(es6문법)을 사용할 수 없다.
//const fs = require("fs"); <- 이런식으로 작성해야함.
import fs from "fs";
import { resolve } from "path";
// path : 모듈은 Node의 내장모듈로서 javascript에서 폴더나 파일의 경로를 쉽게 문자열로 만들어주는 유틸리티 모듈이다.
const basePath = resolve(); // 현재 경로가 basePath로 잡힌다.

const filenames = {
  messages: resolve(basePath, "src/db/messages.json"),
  users: resolve(basePath, "src/db/users.json"),
};

//파일 읽어오기
export const readDB = (target) => {
  try {
    return JSON.parse(fs.readFileSync(filenames[target], "utf-8")); // 파일 읽어오기
  } catch (err) {
    console.error(err);
  }
};

//파일에 작성하기
export const writeDB = (target, data) => {
  try {
    return fs.writeFileSync(filenames[target], JSON.stringify(data)); // fs.writeFileSync(file,data,options)  // data : file에 기록된 데이타.
  } catch (err) {
    console.error(err);
  }
};
