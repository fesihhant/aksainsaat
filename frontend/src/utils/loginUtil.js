
export const changeModalStyle = (modalName, isActive = true) => {
    document.querySelector('[data-active-modal="login"]').style.display = 'none';
    document.querySelector('[data-active-modal="register"]').style.display = 'none';
    document.querySelector('[data-active-modal="forgotPassword"]').style.display = 'none';
    document.querySelector('[data-active-modal="sendActivation"]').style.display = 'none';
    
    const modal = document.querySelector(`[data-active-modal="${modalName}"]`);
    if (!modal) {
        console.error(`Modal with name ${modalName} not found`);
        return;
    }
    if (isActive) {
        modal.style.display = 'flex';
        modal.classList.add('active');
        return;
    }else {
        modal.style.display = 'none';
        modal.classList.remove('active');
    }
}