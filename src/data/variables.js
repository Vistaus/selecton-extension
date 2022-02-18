/// Currently non user-configurable settings 
var wordsLimitToProccessText = 5;
var secondaryColor = 'lightBlue';
var ignoreWhenTextFieldFocused = true;
var convertWhenOnlyFewWordsSelected = true;
var addSelectionTextShadow = false;
var selectionTextShadowOpacity = 0.75;
var allowWebsitesOverrideSelectionColor = true;

/// Service variables
var copyLabel = 'Copy';
var searchLabel = 'Search';
var openLinkLabel = 'Open';
var translateLabel = 'Translate';
var showOnMapLabel = 'Show on map';
var cutLabel = 'Cut';
var pasteLabel = 'Paste';
var dictionaryLabel = 'Dictionary';
var markerLabel = 'Highlight';
var italicLabel = 'Italic';
var boldLabel = 'Bold';
var strikeLabel = 'Strike';

var ratesLastFetchedDate;
var tooltip;
var secondaryTooltip;
var arrow;
var selection;
var selectedText;
var dontShowTooltip = false;
var isDraggingTooltip = false;
var isDraggingDragHandle = false;
var draggingHandleIndex;
var tooltipIsShown = false;
var firstButtonBorderRadius = '3px 0px 0px 3px';
var lastButtonBorderRadius = '0px 3px 3px 0px';
var onlyButtonBorderRadius = '3px';
var isDarkTooltip = true;
var linkSymbolsToShow = 20;
var selectionHandleLineHeight = 25;
var searchButton;
var copyButton;
var browserLanguage;
var browserCurrency;
var browserMetricSystem;
var addButtonIcons;
var verticalSecondaryTooltip;
var lastMouseUpEvent;
var previousSelection;
var tooltipOnBottom = false;
var configsWereLoaded = false;
var currencyRatesWereLoaded = false;
var isTextFieldFocused = false;
var domainIsBlacklistedForSnapping;

var timerToRecreateOverlays;
var delayToRecreateOverlays = 150;
var floatingTooltipTop = false;
var floatingTooltipBottom = false;