# 스팸 추격기 v1.0.1
스팸 요격기(`fedi_findandkillspam`)의 계승작입니다.

- Misskey 전용입니다. 아직은.
- 노트의 공개범위에 관계없이 스팸을 **추격**합니다.
- 멘션 개수에 관계없이 스팸을 **추격**합니다.
- 기타 노트의 내용 변화에 관계없이 스팸을 **추격**해서 자동으로 정지합니다.

## 사용 방법
1. [여기서 최신 실행 파일을 내려받습니다.](https://github.com/nulta/spam-chaser/releases)]
2. 실행하고, 화면의 지시에 따라 최초 설정을 합니다.
3. 설정을 마치면 추격기가 자동으로 시작됩니다.

### API key 발급 방법
1. AiScript 스크래치패드(`/scratchpad`)를 엽니다.
2. 아래의 AiScript를 실행하면 토큰이 발급됩니다. 
```
<: "Token is:"
<: Mk:api("miauth/gen-token" {
  session: null,
  name: 'SpamChaser',
  description: 'github.com/nulta/spam-chaser',
  permission: ['read:admin:show-user', 'write:notes', 'write:admin:suspend-user', 'read:account'],
}).token
```

**주의:** 스팸 요격기(`fedi_findandkillspam`)와는 **다른** 권한을 사용합니다.\
따라서 이전에 요격기에서 사용하던 API 키가 있어도, 그대로 재사용할 수는 없습니다.

이후, 가능하다면 제어판의 **역할 설정**에서 본인의 **요청 빈도 제한**을 0%로 설정해 주세요.
- 노트 삭제 개수 제한(시간당 300개)을 우회하기 위함입니다.
- 설정하지 않아도 일단 스팸봇 정지에는 문제가 없습니다.

## 변경 로그
- v1.0: 출시.
- v1.0.1: `Judge.noteHarmfulness`에서 발생하는 undefined 참조 오류 수정.
