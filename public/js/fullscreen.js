function createFullscreenButtonForDomElement(element) {
    let b = createButton("Go Fullscreen!");
    b.mousePressed(() => goFullScreen(element));
    return b;
}


function goFullScreen(element) {

    console.log(document.fullscreenEnabled);
    console.log(document.webkitIsFullScreen);

    if (!document.webkitIsFullScreen &&  !document.fullscreenEnabled) {
        if (element) {
            const canvas = element;
            if (canvas.requestFullScreen)
                canvas.requestFullScreen();
            else if (canvas.webkitRequestFullScreen)
                canvas.webkitRequestFullScreen();
            else if (canvas.mozRequestFullScreen)
                canvas.mozRequestFullScreen();
        }
    }
    else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        }
    }

}