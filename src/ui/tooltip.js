function createTooltip(e, recreated = false) {

    if (isDraggingTooltip) return;
    if (dontShowTooltip == true) return;
    if (e !== undefined && e !== null && e.button !== 0) return;

    setTimeout(function () {
        lastMouseUpEvent = e;
        if (selection == null || selection == undefined) return;
        // hideTooltip();

        if (configs.snapSelectionToWord) {
            if (isTextFieldFocused == true && configs.dontSnapTextfieldSelection == true) {
                if (configs.debugMode)
                    console.log('Word snapping rejected while textfield is focused');
            } else if (configs.disableWordSnappingOnCtrlKey && e !== undefined && (e.ctrlKey == true || e.metaKey == true)) {
                if (configs.debugMode)
                    console.log('Word snapping rejected due to pressed CTRL key');
            } else {
                selectedText = selection.toString();

                selectedTextIsCode = false;
                if (configs.disableWordSnapForCode)
                    for (let i = 0, l = codeMarkers.length; i < l; i++) {
                        if (selectedText.includes(codeMarkers[i])) {
                            selectedTextIsCode = true; break;
                        }
                    }

                /// dont snap if selection is modified by drag handle, or if it looks like code
                if (isDraggingDragHandle == false && selectedTextIsCode == false)
                    if (domainIsBlacklistedForSnapping == false && e.detail < 2 && (timerToRecreateOverlays == null || timerToRecreateOverlays == undefined))
                        snapSelectionByWords(selection);
            }
        }

        /// Special tooltip for text fields
        if (isTextFieldFocused) {
            if (configs.addActionButtonsForTextFields == false) return;

            /// Create text field tooltip
            setUpTooltip();
            addBasicTooltipButtons('textfield');

            if (tooltip.children.length < 2) {
                /// Don't add tooltip with no buttons
                tooltip.remove();
                return;
            }

            document.body.appendChild(tooltip);

            /// Check resulting DY to be out of view
            let resultDy = e.clientY - tooltip.clientHeight - arrow.clientHeight - 9;
            let vertOutOfView = resultDy <= 0;
            if (vertOutOfView) {
                resultDy = e.clientY + arrow.clientHeight;
                arrow.classList.add('arrow-on-bottom');
            }

            showTooltip(e.clientX, resultDy);
            return;
        }

        /// Hide previous tooltip if exists
        if (tooltip !== null && tooltip !== undefined) hideTooltip();

        /// Check text selection again
        /// Fix for recreating tooltip when clicked inside selected area (noticed only in Firefox)
        selection = window.getSelection();
        selectedText = selection.toString().trim();

        if (selectedText == '') {
            hideDragHandles();
            return;
        }

        setUpTooltip(recreated);

        /// Add basic buttons (Copy, Search, etc)
        addBasicTooltipButtons(null);

        if (dontShowTooltip == false && selectedText !== null && selectedText !== '') {
            addContextualButtons(function () {
                /// Set border radius for first and last buttons
                setBorderRadiusForSideButtons(tooltip);

                /// Append tooltip to the DOM
                document.body.appendChild(tooltip);

                /// Calculate tooltip position and show tooltip
                calculateTooltipPosition(e);

                /// Create search tooltip for custom search options)
                if (configs.customSearchOptionsDisplay == 'hoverCustomSearchStyle')
                    setTimeout(function () {
                        if (configs.secondaryTooltipEnabled && configs.customSearchButtons !== null && configs.customSearchButtons !== undefined && configs.customSearchButtons !== [])
                            setHoverForSearchButton(searchButton);
                    }, 5);

                /// Selection change listener
                setTimeout(function () {
                    if (tooltipIsShown == false) return;
                    document.addEventListener("selectionchange", selectionChangeListener);
                }, configs.animationDuration);
            });

            // setTimeout(function () {

            //     /// Append tooltip to the DOM
            //     document.body.appendChild(tooltip);

            //     /// Calculate tooltip position - add a delay so that we can access tooltip clientHeight
            //     setTimeout(function () {
            //         calculateTooltipPosition(e);
            //     }, 5);

            //     /// Create search tooltip for custom search options)
            //     if (configs.customSearchOptionsDisplay == 'hoverCustomSearchStyle')
            //         setTimeout(function () {
            //             if (configs.secondaryTooltipEnabled && configs.customSearchButtons !== null && configs.customSearchButtons !== undefined && configs.customSearchButtons !== [])
            //                 setHoverForSearchButton(searchButton);
            //         }, 5);

            //     /// Selection change listener
            //     setTimeout(function () {
            //         if (tooltipIsShown == false) return;
            //         document.addEventListener("selectionchange", selectionChangeListener);
            //     }, configs.animationDuration);

            //     /// Set border radius for first and last buttons
            //     setBorderRadiusForSideButtons(tooltip);
            // }, 0);

        } else hideTooltip();

    }, 0);
}

function setUpTooltip(recreated = false) {

    /// Create tooltip and it's arrow
    tooltip = document.createElement('div');
    tooltip.className = 'selection-tooltip selecton-entity';
    if (configs.verticalLayoutTooltip) {
        tooltip.classList.add('vertical-layout-tooltip');
        tooltip.classList.add('reversed-order');
    }
    if (configs.buttonsStyle == 'onlyicon' || configs.buttonsStyle == 'iconlabel') tooltip.classList.add('tooltip-with-icons');
    tooltip.style.opacity = 0.0;
    tooltip.style.position = 'fixed';
    tooltip.style.transition = `opacity ${configs.animationDuration}ms ease-out, transform ${configs.animationDuration}ms ease-out`;
    if (recreated) tooltip.style.transition = `opacity ${configs.animationDuration}ms ease-out`;
    tooltip.style.transform = returnTooltipRevealTransform(false);
    // tooltip.style.transformOrigin = '50% 100% 0';
    tooltip.style.transformOrigin = configs.tooltipRevealEffect == 'scaleUpTooltipEffect' ? '50% 30% 0' : configs.tooltipRevealEffect == 'scaleUpFromBottomTooltipEffect' ? '50% 125% 0' : '50% 100% 0';

    if (configs.useCustomStyle && configs.tooltipOpacity != 1.0 && configs.tooltipOpacity != 1 && configs.fullOpacityOnHover) {
        tooltip.onmouseover = function () {
            setTimeout(function () {
                if (dontShowTooltip == true) return;
                try {
                    tooltip.style.opacity = 1.0;
                } catch (e) { }
            }, 1);
        }
        tooltip.onmouseout = function () {
            setTimeout(function () {
                if (dontShowTooltip == true) return;
                try {
                    tooltip.style.opacity = configs.tooltipOpacity;
                } catch (e) { }
            }, 1);
        }
        if (configs.debugMode) {
            console.log('Selecton tooltip inactive opacity: ' + configs.tooltipOpacity.toString());
            console.log('Set tooltip opacity listeners');
        }
    }

    /// Add tooltip arrow
    arrow = document.createElement('div');
    if (configs.showTooltipArrow) arrow.setAttribute('class', 'selection-tooltip-arrow');
    tooltip.appendChild(arrow);

    /// Make the tooltip draggable by arrow
    if (configs.showTooltipArrow && configs.draggableTooltip) {
        makeTooltipElementDraggable(arrow);
    }

    /// Apply custom stylings
    if (configs.useCustomStyle) {
        if (configs.addTooltipShadow) {
            tooltip.style.boxShadow = `0 2px 7px rgba(0,0,0,${configs.shadowOpacity})`;
            arrow.style.boxShadow = `1px 1px 3px rgba(0,0,0,${configs.shadowOpacity / 1.5})`;
        }
        /// Set rounded corners for buttons
        if (configs.verticalLayoutTooltip) {
            firstButtonBorderRadius = `0px 0px ${configs.borderRadius / 1.5}px ${configs.borderRadius / 1.5}px`;
            lastButtonBorderRadius = `${configs.borderRadius / 1.5}px ${configs.borderRadius / 1.5}px 0px 0px`;
        } else {
            firstButtonBorderRadius = `${configs.borderRadius / 1.5}px 0px 0px ${configs.borderRadius / 1.5}px`;
            lastButtonBorderRadius = `0px ${configs.borderRadius / 1.5}px ${configs.borderRadius / 1.5}px 0px`;
        }

        onlyButtonBorderRadius = `${configs.borderRadius / 1.5}px`;
    } else {
        /// Set default corners for buttons
        firstButtonBorderRadius = '3px 0px 0px 3px';
        lastButtonBorderRadius = '0px 3px 3px 0px';
        onlyButtonBorderRadius = '3px';
    }


    if (configs.debugMode)
        console.log('Selecton tooltip was created');

}

function calculateTooltipPosition(e) {
    const selStartDimensions = getSelectionCoordinates(true);
    const selEndDimensions = getSelectionCoordinates(false);

    tooltipOnBottom = false;
    let canAddDragHandles = true;
    if (selStartDimensions.dontAddDragHandles) canAddDragHandles = false;
    let dyForFloatingTooltip = 15;
    let dyWhenOffscreen = window.innerHeight / 3;
    let tooltipHeight = tooltip.clientHeight;
    let dxToShowTooltip, dyToShowTooltip;

    if (configs.tooltipPosition == 'overCursor' && e.clientX < window.innerWidth - 30) {

        /// Show it on top of selection, dx aligned to cursor
        // showTooltip(e.clientX - tooltip.clientWidth / 2, selStartDimensions.dy - tooltipHeight - (arrow.clientHeight / 1.5) - 2);
        dyToShowTooltip = selStartDimensions.dy - tooltipHeight - (arrow.clientHeight / 1.5) - 2;
        let vertOutOfView = dyToShowTooltip <= 0;

        if (vertOutOfView || (selStartDimensions.dy < selEndDimensions.dy && selEndDimensions.backwards !== true)) {
            /// show tooltip under selection
            // let possibleDyToShowTooltip = selEndDimensions.dy + (configs.verticalLayoutTooltip ? 20 : tooltipHeight / 2) + (arrow.clientHeight / 2);
            let possibleDyToShowTooltip = selEndDimensions.dy + (selEndDimensions.lineHeight ?? 0) + arrow.clientHeight;

            if (possibleDyToShowTooltip < window.innerHeight) {
                dyToShowTooltip = possibleDyToShowTooltip;
                setTooltipOnBottom();

                if (configs.verticalLayoutTooltip) tooltip.classList.remove('reversed-order');
            }
        }

        /// Check to be off-screen on top
        if (dyToShowTooltip < 0 && tooltipOnBottom == false) dyToShowTooltip = dyWhenOffscreen;

        /// Calculating DX
        // dxToShowTooltip = e.clientX - tooltip.clientWidth / 2;
        dxToShowTooltip = e.clientX;

    } else {
        /// Calculating DY
        dyToShowTooltip = selStartDimensions.dy - tooltipHeight - arrow.clientHeight;

        /// If tooltip is going off-screen on top...
        let vertOutOfView = dyToShowTooltip <= 0;
        if (vertOutOfView) {
            /// check to display on bottom
            let resultingDyOnBottom = selEndDimensions.dy + (selEndDimensions.lineHeight ?? 0) + arrow.clientHeight;
            if (resultingDyOnBottom < window.innerHeight) {
                dyToShowTooltip = resultingDyOnBottom;
                setTooltipOnBottom();
                if (configs.verticalLayoutTooltip) tooltip.classList.remove('reversed-order');
            } else {
                /// if it will be off-screen as well, use off-screen dy
                dyToShowTooltip = dyWhenOffscreen;
            }
        }

        /// Add small padding
        if (configs.showTooltipArrow) dyToShowTooltip = dyToShowTooltip + 2;

        /// Calculating DX
        try {
            /// New approach - place tooltip in horizontal center between two selection handles
            const delta = selEndDimensions.dx > selStartDimensions.dx ? selEndDimensions.dx - selStartDimensions.dx : selStartDimensions.dx - selEndDimensions.dx;

            if (selEndDimensions.dx > selStartDimensions.dx)
                dxToShowTooltip = selStartDimensions.dx + (delta / 2);
            else
                dxToShowTooltip = selEndDimensions.dx + (delta / 2);
        } catch (e) {
            if (configs.debugMode)
                console.log(e);

            /// Fall back to old approach - place tooltip in horizontal center selection rect,
            /// which may be in fact bigger than visible selection
            const selDimensions = getSelectionRectDimensions();
            dxToShowTooltip = selDimensions.dx + (selDimensions.width / 2);
        }
    }

    if (configs.floatingOffscreenTooltip) {
        /// Keep panel floating when off-screen
        floatingTooltipTop = false; floatingTooltipBottom = false;
        if (dyToShowTooltip < 0) {
            dyToShowTooltip = dyForFloatingTooltip;
            floatingTooltipTop = window.scrollY;
        } else if (dyToShowTooltip > window.innerHeight) {
            dyToShowTooltip = window.innerHeight - (tooltipHeight ?? 50) - dyForFloatingTooltip;
            floatingTooltipBottom = window.scrollY;
        }
    }

    showTooltip(dxToShowTooltip, dyToShowTooltip);

    if (configs.addDragHandles && canAddDragHandles)
        setDragHandles(selStartDimensions, selEndDimensions);
}

function showTooltip(dx, dy) {
    tooltip.style.pointerEvents = 'none';
    tooltip.style.opacity = configs.useCustomStyle ? configs.tooltipOpacity : 1.0;
    tooltip.style.top = `${dy}px`;
    tooltip.style.left = `${dx}px`;

    /// Set reveal animation type
    tooltip.style.transform = returnTooltipRevealTransform(true);

    /// Check for colliding with side edges
    checkTooltipForCollidingWithSideEdges();

    if (configs.debugMode)
        console.log('Selecton tooltip is shown');
    tooltipIsShown = true;

    /// Make tooltip interactive only after transition ends
    let currentTooltip = tooltip;
    setTimeout(function () {
        if (tooltipIsShown == false || tooltip == null) return;
        currentTooltip.style.pointerEvents = 'all';
    }, configs.animationDuration);

    /// Check for website existing tooltip
    if (configs.shiftTooltipWhenWebsiteHasOwn && configs.tooltipPosition !== 'overCursor')
        setTimeout(function () {

            /// Experimental code to determine website's own selection tooltip
            const websiteTooltips = document.querySelectorAll(`[style*='position: absolute'][style*='transform'],[class^='popup popup_warning']`);

            let websiteTooltip;
            if (websiteTooltips !== null && websiteTooltips !== undefined)
                for (let i = 0, l = websiteTooltips.length; i < l; i++) {
                    const el = websiteTooltips[i];
                    let elementClass;
                    try {
                        elementClass = el.getAttribute('class');
                    } catch (e) { }

                    if (elementClass !== null && elementClass !== undefined && elementClass.toString().includes('selection-tooltip')) {

                    } else if (el.style !== undefined) {
                        let transformStyle;
                        let elementStyle;

                        try {
                            transformStyle = el.style.transform.toString();
                            elementStyle = el.getAttribute('style').toString();
                        } catch (e) { }

                        // if (elStyle !== null && elStyle !== undefined && elStyle.includes('translate3d')) {
                        // if (!el.getAttribute('class').toString().includes('selection-tooltip'))
                        if (elementStyle == undefined) continue;
                        if ((elementStyle.includes('position: absolute') && transformStyle !== null && transformStyle !== undefined && transformStyle.includes('translate') && transformStyle !== 'translateY(0px)' && transformStyle !== 'translate(0px, 0px)')
                            || (elementStyle.includes('left:') && elementStyle.includes('top:'))
                        ) {
                            if (el.clientHeight < 100 && el.clientHeight > 5 && el.clientWidth > 20 && el.getAttribute('id') !== 'cmg-fullscreen-image') {
                                if (configs.debugMode) {
                                    console.log('Detected selection tooltip on the website with following style:');
                                    console.log(elementStyle);
                                }

                                websiteTooltip = el;
                                break;
                            }
                        }
                    }
                };

            if (websiteTooltip !== null && websiteTooltip !== undefined) {
                tooltip.style.transition = `top 200ms ease-out, opacity ${configs.animationDuration}ms ease-out, transform 200ms ease-out`;
                tooltip.style.top = `${dy - websiteTooltip.clientHeight}px`;

                arrow.style.opacity = 1.0;
                arrow.style.transition = 'opacity 200ms ease-out';
                arrow.style.opacity = 0.0;

                setTimeout(function () {
                    tooltip.style.transition = `opacity ${configs.animationDuration}ms ease-out, transform 200ms ease-out`;
                    arrow.remove();
                }, 200);
            } else {
                // arrow.style.opacity = 1.0;
                if (configs.debugMode) console.log('Selecton didnt found any website tooltips');
            }

        }, configs.animationDuration);
}

function hideTooltip(animated = true) {
    if (tooltip == null || tooltip == undefined) return;

    if (configs.debugMode) {
        console.log('--- Hiding Selecton tooltips ---');
        console.log('Checking for existing tooltips...');
    }

    /// Hide all tooltips
    const oldTooltips = document.querySelectorAll('.selecton-entity');

    if (oldTooltips !== null && oldTooltips.length !== 0) {
        tooltipIsShown = false;

        if (configs.debugMode)
            console.log(`Found ${oldTooltips.length} tooltips to hide`);

        for (let i = 0, l = oldTooltips.length; i < l; i++) {
            const oldTooltip = oldTooltips[i];
            if (!animated)
                oldTooltip.style.transition = '';
            oldTooltip.style.opacity = 0.0;
            oldTooltip.style.pointerEvents = 'none';

            setTimeout(function () {
                oldTooltip.remove();
            }, animated ? configs.animationDuration : 0);
        }
    } else {
        if (configs.debugMode)
            console.log('No existing tooltips found');
    }

    tooltip.style.pointerEvents = 'none';
    tooltip = null;
    secondaryTooltip = null;
    timerToRecreateOverlays = null;
    isTextFieldFocused = false;

    document.removeEventListener("selectionchange", selectionChangeListener);
    window.removeEventListener('mousemove', mouseMoveToHideListener);
}