module.exports = {
    // linter가 파일을 분석할 때, 미리 정의된 전역변수에 무엇이 있는지 명시하는 속성
    "env": {
        // 브라우저의 document와 같은 객체 사용 여부
        "browser": false,
        "es2021": true,
        // node.js에서 console과 같은 전역변수 사용 여부
        "node": true
    },
    // eslint의 룰을 기본 권장설정으로 설정
    "extends": [
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended"
    ],
    "overrides": [
    ],
    "parser": "@typescript-eslint/parser",
    // 코드를 해석하는 parser에 대한 설정
    "parserOptions": {
        // 최신 버전
        "ecmaVersion": "latest",
        // 모듈 export를 위해 import, export 사용 가능여부 설정
        "sourceType": "module"
    },
    // 코드 포맷을 prettier로 설정
    "plugins": [
        "@typescript-eslint"
    ],
    // ESLint가 무시할 디렉토리, 파일을 설정
    "ignorePatterns": [
        "node_modules/"
    ],
    // ESLint 룰을 설정
    "rules": {
        // prettier에 맞게 룰을 설정
        "prettier/prettier": "error"
    }
}
