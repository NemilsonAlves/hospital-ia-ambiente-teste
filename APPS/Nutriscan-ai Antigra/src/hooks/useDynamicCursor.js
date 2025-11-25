import { useEffect } from 'react';

// Cursores por seção
const sectionCursors = {
    header: ['/apple-cursor.svg', '/orange-cursor.svg'],
    hero: ['/strawberry-cursor.svg', '/watermelon-cursor.svg'],
    features: ['/banana-cursor.svg', '/pineapple-cursor.svg', '/kiwi-cursor.svg', '/grape-cursor.svg']
};

const allFruitCursors = [
    '/apple-cursor.svg',
    '/banana-cursor.svg',
    '/orange-cursor.svg',
    '/grape-cursor.svg',
    '/strawberry-cursor.svg',
    '/pineapple-cursor.svg',
    '/watermelon-cursor.svg',
    '/kiwi-cursor.svg'
];

let currentGlobalIndex = 0;
let sectionIndices = {
    header: 0,
    hero: 0,
    features: 0
};

export const useSectionCursor = () => {
    useEffect(() => {
        const updateCursorForSection = (section, cursorUrl) => {
            const sectionElement = document.querySelector(`.${section}-section, .app-${section}`);
            if (sectionElement) {
                sectionElement.style.cursor = `url('${cursorUrl}') 12 12, auto`;

                // Update interactive elements within section
                const interactiveElements = sectionElement.querySelectorAll('a, button');
                interactiveElements.forEach(element => {
                    element.style.cursor = `url('${cursorUrl}') 12 12, pointer`;
                });
            }
        };

        const changeSectionCursors = () => {
            document.body.style.opacity = '0.97';

            setTimeout(() => {
                // Update each section with its own cursor rotation
                Object.keys(sectionCursors).forEach(section => {
                    const cursors = sectionCursors[section];
                    sectionIndices[section] = (sectionIndices[section] + 1) % cursors.length;
                    const cursorUrl = cursors[sectionIndices[section]];
                    updateCursorForSection(section, cursorUrl);
                });

                document.body.style.opacity = '1';
            }, 150);
        };

        // Initial setup
        Object.keys(sectionCursors).forEach(section => {
            const cursorUrl = sectionCursors[section][0];
            updateCursorForSection(section, cursorUrl);
        });

        // Change cursors every 4 seconds
        const intervalId = setInterval(changeSectionCursors, 4000);

        return () => {
            clearInterval(intervalId);
        };
    }, []);
};

export const useDynamicCursor = () => {
    useEffect(() => {
        document.body.style.transition = 'opacity 0.3s ease-in-out';

        const changeCursor = () => {
            document.body.style.opacity = '0.95';

            setTimeout(() => {
                currentGlobalIndex = (currentGlobalIndex + 1) % allFruitCursors.length;
                const cursorUrl = allFruitCursors[currentGlobalIndex];

                document.body.style.cursor = `url('${cursorUrl}') 12 12, auto`;

                const interactiveElements = document.querySelectorAll('a, button');
                interactiveElements.forEach(element => {
                    element.style.cursor = `url('${cursorUrl}') 12 12, pointer`;
                });

                document.body.style.opacity = '1';
            }, 150);
        };

        const intervalId = setInterval(changeCursor, 3000);
        const initialCursor = allFruitCursors[0];
        document.body.style.cursor = `url('${initialCursor}') 12 12, auto`;

        return () => {
            clearInterval(intervalId);
            document.body.style.transition = '';
        };
    }, []);
};

export default useDynamicCursor;
