function initOrderList() {

    var $order = $('#order');
    $('#sortSelection', $order).change(function (e) {
        $('.orderForm', $order).submit();
    });

    // if there is a previously selected one restore it after postback
    var visibleId = $('.visibleId').val();
    if (visibleId != '') {
        $('#' + visibleId, $order).show().addClass('selected');
        $('#orderRow' + visibleId).addClass('selected');          
    }

    $('.showDetails', $order).click(function (e) {
        e.preventDefault();

        var clipRef = $(this).data("clipref");
        var clickedItemIsSelected = $(this).closest("tr").hasClass("selected");
        var transitionSpeed = 300;

        // only allow a single one open at a time, but dont change the current one yet
        $('.itemDetail', $order).not('#' + clipRef).removeClass('selected'); // remove the drop down arrow first
        $('.itemDetail', $order).not('#' + clipRef).slideUp(transitionSpeed);
        $('.orderRow', $order).removeClass('selected');

        var $row = $(this).closest('tr');
        var $orderItems = $('#' + clipRef, $order);
        if (clickedItemIsSelected) {
            $row.removeClass('selected');
            $orderItems.removeClass('selected');
            $orderItems.slideUp(transitionSpeed);
        }
        else {
            $row.addClass('selected');
            $orderItems.addClass('selected');
            $orderItems.slideDown(transitionSpeed);
            $('.visibleId', $order).val(clipRef); // store the currently selected row for redisplay after postback
        }
    });

    $('.copyright input[type=checkbox]', $order).change(function () {
        var $this = $(this);
        var $button = $this.closest('.itemDetail').find('.submitButton');
        $button.prop('disabled', !$this.is(':checked'));
    });
}

function initBasket() {

    var $basket = $('#order');

    // Disabled submit button after clicking
    var $submitButton = $('.submit', $basket);
    $submitButton.click(function () {
        var $this = $(this);
        setTimeout(function () { $this.prop('disabled', true); }, 10);
        var $processingBtn = $('.orderProcessing', $basket);
        if ($processingBtn.length) {
            $this.hide();
            $processingBtn.show();
        }
    });
    
    // Accordian
    var $accordian = $('#accordian', $basket);
    var $accordianControl = $('.accordianControl a', $basket);
    
    if ($('#hidAccordianState').val() == "shown") {
        $accordianControl.addClass('hide');
        $accordian.show();
    }
    else {
        $accordianControl.addClass('show');
        $accordianControl.removeClass('hide');
        $accordian.hide();
    }

    $accordianControl.click(function (e) {

        e.preventDefault();

        $accordian.slideToggle(300, function () {
            if ($accordianControl.hasClass('hide')) {
                $accordianControl.removeClass('hide');
                $accordianControl.addClass('show');
                $('#hidAccordianState').val("hidden");
            }
            else {
                $accordianControl.removeClass('show');
                $accordianControl.addClass('hide');
                $('#hidAccordianState').val("shown");
            }
        });
    });

    // Sorting
    $('#sortSelection', $basket).change(function (e) {
        $('#nonPinBasketForm', $basket).submit();
    });

    // Basket tabs
    $('.tabcontent', $basket).Tabs();

    // Toggle form fields
    $('.toggle', $basket).on('change', function () {
        var $this = $(this);
        var targetId = $this.data('target');
        var parentId = $this.data('parent');
        var $target = $(targetId);
        var $parent = $(parentId);
        var $immediateTargets = $parent.find('.target');
        $immediateTargets.hide();
        if ($this.is(':checked')) {
            $target.show();
        }
    });

    // make the note mandatory if the "other" checkbox is selected
    $('.enquirySection .questionCheckboxOptions #other', $basket).change(function () {
        if ($(this).attr('checked') == 'checked') {
            $('.enquirySection #noteQuestionLabel').addClass('mandatory');
        }
        else {
            $('.enquirySection #noteQuestionLabel').removeClass('mandatory');
        }
    });

    // Toggle selecting checkboxes
    $('.toggleAllItems', $basket).click(function (e) {
        var $this = $(this);
        e.preventDefault();

        if ($this.hasClass('select')) {
            $('.removeClip > input[type=checkbox]', $basket).prop('checked', true);
            $this.removeClass('select')
            $this.addClass('deselect')
            $this.html('Deselect all');
        }
        else {
            $('.removeClip > input[type=checkbox]', $basket).prop('checked', false);
            $this.removeClass('deselect')
            $this.addClass('select')
            $this.html('Select all');
        }
    });

    // Licence control
    $('#addLicence', $basket).click(function (e) {
        return false;
    });

    $('#licences').on('click', '.removeLicence', function () {
        var $this = $(this);
        $($this.attr('href')).remove();
        return false;
    });
    
    // Billing country
    $('#BillingCountry').change(function () {
        $('#orderPayment').submit();
    });

    /* What happens next popup */
    if (userIsLoggedIn) {
        if (showWhatHappensNextOverlay) {
            $("#nonPinEnquiryForm").submit(function (e) {

                var self = this;
                e.preventDefault();

                $.fancybox({
                    'hideOnContentClick': false, 'cyclic': false, 'scrolling': false, 'href': '#whatHappensNext', 'showCloseButton': false,
                    onStart: function () {
                        $('.addToClipAgreeButton').click(function () {
                            $.fancybox.close();
                            var hideClipBinOverlay = $(".hideClipBinOverlay").is(":checked");
                            if (hideClipBinOverlay) {
                                //update on server
                                UpdateHideWhatHappensNext();
                                //update on client
                                showWhatHappensNextOverlay = false;
                            }
                            return false;
                        });
                    },
                    onCleanup: function () {
                        $('.addToClipAgreeButton').unbind('click');
                    },
                    onClosed: function (itemArray, selectedIndex, selectedOpts) {
                        var submitForm = $('#hidCloseOrCancel').val() == 'close';
                        if (submitForm) {
                            self.submit();
                        }
                    }
                });

                return false;
            });
        }
    }

    UpdateHideWhatHappensNext = function () {
        $.get("/ajax/clips/cliphandler.ashx?action=UpdateHideWhatHappensNext");
        return false;
    };
}

function initMiniClipBin() {
    $('.addHover').removeClass('addHover');
    $('.miniClipBin .tabButton, .miniClipBin .btnClipShared, .miniClipBin .btnClipMy').click(function () {
        $('.miniClipBin .clipType').removeClass('btnLeft').removeClass('btnRight');
        $('.miniClipBin .tabButton').removeClass('selected');
        if ($(this).hasClass('btnRight')) {
            $('.miniClipBin .clipType').addClass('btnRight');
            $('.miniClipBin .tabButton.btnRight').addClass('selected');
            if (!$('.currentEnq').hasClass("enquiry-loaded")) {
                loadEnquiryContent();
            }
        }
        else {
            $('.miniClipBin .tabButton.btnLeft').addClass('selected');

            if ($('#clipSrcMy').is(':checked') && !$('.clipBinSect .myClipContainer').hasClass("clipbin-loaded")) {
                loadClipbinContent();
            } else if (!$('.clipBinSect .sharedClipContainer').hasClass("clipbin-loaded")) {
                loadSharedClipbinContent();
            }

        }
    });

    $('.btnClipRequest').click(function () {
        $(this).next('.sharedRequests').toggleClass('open');
    });
    $('.sharedRequests .btnClose').click(function () {
        $(this).parent().removeClass('open');
    });

    /* SWITCH BETWEEN MY CLIPBINS AND SHARED CLIPBINS */
    $('.btnClipMy').click(function () {
        $('.myClipContainer').addClass('open');
        $('.sharedClipContainer').removeClass('open');
        $('.btnClipMy').prop('checked', true);
    });

    $('.btnClipShared').click(function () {
        $('.myClipContainer').removeClass('open');
        $('.sharedClipContainer').addClass('open');
        $('.btnClipShared').prop('checked', true);
        if (!$('.clipBinSlideOut').length) {
            if ($('#clipbin-shared').html() == "") {
                ClipbinClip.goToClipBinPage($('#sharedClipbinSelectDropdown option:eq(0)').val(), 1, '#clipbin-shared');
            }
        }
    });

    /* NEW CLIPBIN DROPDOWN */
    $('#mainContent').on('click', '.selectBox .btnPlus, .clipbin-selection .btnPlus', function () {
        $(this).next('.newClipBin').slideToggle();
    });

    $('.newClipBin .btnClose').click(function () {
        $(this).parent().slideUp();
    });

    /* SLIDE-OUT ON HOVER */
    $('.miniClipBin .sideBar button.expand').mouseenter(function () {
        $(this).animate({ width: '+=20' }, 800);
    });

    $('.miniClipBin .sideBar button.expand').mouseleave(function () {
        $(this).animate({ width: '-=20' }, 800);
    });

    /* SLIDE-OUT CLIPBIN */
    $('.miniClipBin .sideBar button.expand').click(function () {
        $('.miniClipBin').addClass('open');
        $('.miniClipBin').stop(true, true).animate({ left: '-=800px' }, 1200);
        $('.miniClipBin .sideBar').delay(300).fadeOut(1200);
        $('.miniClipBg').fadeIn(1000);
        if (!$('.currentEnq').hasClass("enquiry-loaded") && $('.expanded-cart-tab').hasClass("selected")) {
            loadEnquiryContent();
        }
        if ($('.expanded-clipbins-tab').hasClass("selected")) {
            if ($('#clipSrcMy').is(':checked') && !$('.clipBinSect .myClipContainer').hasClass("clipbin-loaded")) {
                loadClipbinContent();
            } else if ($('#clipSrcShared').is(':checked') && !$('.clipBinSect .sharedClipContainer').hasClass("clipbin-loaded")) {
                loadSharedClipbinContent();
            }
        }
    });

    $('.miniClipBin .clipBinSlideOut button.expand').click(function () {
        $('.miniClipBin').stop(true, true).animate({ left: '+=800px' }, 1200, function () { $('.miniClipBin').removeClass('open'); });
        $('.miniClipBin .sideBar').delay(300).fadeIn(1900);
        $('.miniClipBg').fadeOut(1000);
    });

    readMore('.clipBinList');

    $('#rightContent').on("click", ".submitRedirect", function () {
        var link = $(this);
        link.html(link.html() + '<img alt="adding to enquiry" src="/i/source/search/searchLoaderIcon.gif">');
        return true;
    });
}

function readMore(containerSelector) {
    $(containerSelector).on('click', '.btnSlideDown', function (e) {
        e.preventDefault();
        var btn = this;
        toggleText(btn);
        $(btn).closest('.cbContent').find('.slideDown').slideToggle('slow');
    });
}

function toggleText(el) {
    var attr = 'data-close-text';
    var text = el.getAttribute(attr);
    if (text) {
        var displayText = $(el).text();
        $(el).text(text);
        el.setAttribute(attr, displayText);
    }
}

function loadClipbinContent() {

    ClipbinClip.goToClipBinPage($("#activeClipbinId").val(), 1, $("#clipbin"));
    $('.myClipContainer').addClass("clipbin-loaded");

    //var clipBin = $("#clipbin");
    //$.ajax({
    //    url: '/Ajax/ClipBinHandler.ashx?ClipBinId=' + $("#activeClipbinId").val() + '&action=getclips&pageNumber=1',
    //    cache: false,
    //    success: function (data) {
    //        clipBin.html(data);
    //        $('.myClipContainer').addClass("clipbin-loaded");
    //    },
    //    error: function (data) {
    //        alert("There was an error!");
    //        alert(data);
    //    },
    //    complete: function () {
    //        $('.displayPopUp').fancybox({
    //            'hideOnContentClick': false,
    //            'cyclic': true,
    //            'scrolling': true,
    //            'type': 'inline',
    //            'href': '#videoPopUpDiv'
    //        });
    //    }
    //});
}

function loadSharedClipbinContent() {

    ClipbinClip.goToClipBinPage($("#currentSharedClipbinId").val(), 1, $("#clipbin-shared"));
    $('.sharedClipContainer').addClass("clipbin-loaded");

    //var clipBin = $("#clipbin-shared");
    //$.ajax({
    //    url: '/Ajax/ClipBinHandler.ashx?ClipBinId=' + $("#currentSharedClipbinId").val() + '&action=getclips&pageNumber=1',
    //    cache: false,
    //    success: function (data) {
    //        clipBin.html(data);
    //        $('.sharedClipContainer').addClass("clipbin-loaded");
    //    },
    //    error: function (data) {
    //        alert("There was an error!");
    //        alert(data);
    //    },
    //    complete: function () {
    //        $('.displayPopUp').fancybox({
    //            'hideOnContentClick': false,
    //            'cyclic': true,
    //            'scrolling': true,
    //            'type': 'inline',
    //            'href': '#videoPopUpDiv'
    //        });
    //    }
    //});
}

function loadEnquiryContent() {
    var enquiry = $('.currentEnq');
    enquiry.html('<div class="clipBinLoader"><img src="/i/source/itn_preloader.gif" alt="Loading... Please wait." /></div>');
    $.ajax({
        url: '/Ajax/BasketHandler.ashx',
        cache: false,
        data: 'action=getbasket',
        type: 'post',
        success: function (data) {
            enquiry.html(data);
            initBasket();
            enquiry.addClass("enquiry-loaded");
            //enquiry.find('form .submit').removeClass('submit').addClass('submitRedirect');

            var submitButton = enquiry.find('form .submit');
            submitButton.each(function(index){
                var cartType = $(this).closest('.container').find("input[name='Type1'], input[name='Type2'], input[name='Type3']").val();
                $(this).replaceWith('<a class="button submitRedirect" href="' + enquiry.find('#formActionUrl').val() + '?submitBasket=' + cartType + '">' + $(this).val() + '</a>');
            });
            
      
            //enquiry.find('form').attr("action", enquiry.find('#formActionUrl').val());
        },
        error: function () {

        }
    });
}