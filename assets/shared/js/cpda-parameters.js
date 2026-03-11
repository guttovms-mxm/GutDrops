document.addEventListener("DOMContentLoaded", function () {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const links = document.querySelectorAll('.buylink');

    links.forEach(link => {
        if (link instanceof HTMLAnchorElement) {
            let originalHref = link.href;
            const linkUrl = new URL(originalHref, window.location.origin);

            const extraParams = [];
            urlParams.forEach((value, key) => {
                extraParams.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
            });

            if (extraParams.length > 0) {
                const separator = linkUrl.search ? '&' : '?';
                link.href = linkUrl.href + separator + extraParams.join('&');
            }
        }
    });
});
