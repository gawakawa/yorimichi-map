export function getErrorMessage(status: number): string {
  switch (status) {
    case 400:
      return '入力内容に問題があります。別の地点名でお試しください。';
    case 429:
      return 'リクエスト回数の上限に達しました。しばらく待ってから再度お試しください。';
    case 502:
      return '外部サービスとの通信に失敗しました。しばらく待ってから再度お試しください。';
    case 503:
      return 'AI サービスが一時的に利用できません。しばらく待ってから再度お試しください。';
    default:
      return '予期しないエラーが発生しました。';
  }
}
