document.getElementById('pf-entry')?.remove();
init().catch(error=>{
  notifyError('启动未完成，可刷新后重试',error);
  restoreRoute();
});
