import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { HomeWidgetDto } from '../../../types/home-widgets';

interface WidgetSettingsModalProps {
  widget: HomeWidgetDto | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (widgetId: string, variant: string, enabled: boolean, settings: Record<string, unknown>) => Promise<void>;
  saving: boolean;
}

const WidgetSettingsModal: React.FC<WidgetSettingsModalProps> = ({ widget, isOpen, onClose, onSave, saving }) => {
  const [draftVariant, setDraftVariant] = useState('default');
  const [draftEnabled, setDraftEnabled] = useState(true);
  
  // Specific settings states
  const [draftLegacySectionId, setDraftLegacySectionId] = useState('hero');
  const [draftAutoplay, setDraftAutoplay] = useState(true);
  const [draftAutoplaySpeed, setDraftAutoplaySpeed] = useState(4000);
  const [draftShowMap, setDraftShowMap] = useState(true);
  const [draftGridSource, setDraftGridSource] = useState<'services' | 'portfolio'>('services');
  const [draftGridColumns, setDraftGridColumns] = useState(3);
  const [draftGridMaxItems, setDraftGridMaxItems] = useState(6);
  const [draftGridTitle, setDraftGridTitle] = useState('');
  const [draftGridDescription, setDraftGridDescription] = useState('');
  const [draftCardListSource, setDraftCardListSource] = useState<'services' | 'portfolio'>('services');
  const [draftCardListMaxItems, setDraftCardListMaxItems] = useState(6);
  const [draftCardListTitle, setDraftCardListTitle] = useState('');
  const [draftCardListDescription, setDraftCardListDescription] = useState('');
  const [draftGalleryMaxItems, setDraftGalleryMaxItems] = useState(8);
  const [draftCtaTitle, setDraftCtaTitle] = useState('');
  const [draftCtaDescription, setDraftCtaDescription] = useState('');
  const [draftPrimaryButtonText, setDraftPrimaryButtonText] = useState('');
  const [draftPrimaryButtonLink, setDraftPrimaryButtonLink] = useState('');
  const [draftSecondaryButtonText, setDraftSecondaryButtonText] = useState('');
  const [draftSecondaryButtonLink, setDraftSecondaryButtonLink] = useState('');
  const [draftFormTitle, setDraftFormTitle] = useState('');
  const [draftFormDescription, setDraftFormDescription] = useState('');
  const [draftFormUrl, setDraftFormUrl] = useState('');
  const [draftFormCtaText, setDraftFormCtaText] = useState('');
  const [draftFormCtaUrl, setDraftFormCtaUrl] = useState('');
  const [draftFormHeight, setDraftFormHeight] = useState(760);
  const [draftTestimonialsTitle, setDraftTestimonialsTitle] = useState('');
  const [draftTestimonialsDescription, setDraftTestimonialsDescription] = useState('');
  const [draftTestimonialsMaxItems, setDraftTestimonialsMaxItems] = useState(6);
  const [draftTestimonialsItemsJson, setDraftTestimonialsItemsJson] = useState('');
  const [draftFaqTitle, setDraftFaqTitle] = useState('');
  const [draftFaqDescription, setDraftFaqDescription] = useState('');
  const [draftFaqItemsJson, setDraftFaqItemsJson] = useState('');
  const [draftStatsTitle, setDraftStatsTitle] = useState('');
  const [draftStatsDescription, setDraftStatsDescription] = useState('');
  const [draftStatsColumns, setDraftStatsColumns] = useState(4);
  const [draftStatsItemsJson, setDraftStatsItemsJson] = useState('');
  const [draftProcessTitle, setDraftProcessTitle] = useState('');
  const [draftProcessDescription, setDraftProcessDescription] = useState('');
  const [draftProcessItemsJson, setDraftProcessItemsJson] = useState('');
  const [draftPricingTitle, setDraftPricingTitle] = useState('');
  const [draftPricingDescription, setDraftPricingDescription] = useState('');
  const [draftPricingPlansJson, setDraftPricingPlansJson] = useState('');
  const [draftComparisonTitle, setDraftComparisonTitle] = useState('');
  const [draftComparisonDescription, setDraftComparisonDescription] = useState('');
  const [draftComparisonRowsJson, setDraftComparisonRowsJson] = useState('');
  const [draftLogosWallTitle, setDraftLogosWallTitle] = useState('');
  const [draftLogosWallDescription, setDraftLogosWallDescription] = useState('');
  const [draftLogosWallColumns, setDraftLogosWallColumns] = useState(4);
  const [draftLogosWallItemsJson, setDraftLogosWallItemsJson] = useState('');
  const [draftCaseHighlightsTitle, setDraftCaseHighlightsTitle] = useState('');
  const [draftCaseHighlightsDescription, setDraftCaseHighlightsDescription] = useState('');
  const [draftCaseHighlightsMaxItems, setDraftCaseHighlightsMaxItems] = useState(3);
  const [draftCaseHighlightsItemsJson, setDraftCaseHighlightsItemsJson] = useState('');
  const [draftBeforeAfterTitle, setDraftBeforeAfterTitle] = useState('');
  const [draftBeforeAfterDescription, setDraftBeforeAfterDescription] = useState('');
  const [draftBeforeAfterMaxItems, setDraftBeforeAfterMaxItems] = useState(2);
  const [draftBeforeAfterItemsJson, setDraftBeforeAfterItemsJson] = useState('');
  const [draftFeatureTabsTitle, setDraftFeatureTabsTitle] = useState('');
  const [draftFeatureTabsDescription, setDraftFeatureTabsDescription] = useState('');
  const [draftFeatureTabsItemsJson, setDraftFeatureTabsItemsJson] = useState('');
  const [draftTeamCardsTitle, setDraftTeamCardsTitle] = useState('');
  const [draftTeamCardsDescription, setDraftTeamCardsDescription] = useState('');
  const [draftTeamCardsMaxItems, setDraftTeamCardsMaxItems] = useState(4);
  const [draftTeamCardsItemsJson, setDraftTeamCardsItemsJson] = useState('');
  const [draftTrustBadgesTitle, setDraftTrustBadgesTitle] = useState('');
  const [draftTrustBadgesDescription, setDraftTrustBadgesDescription] = useState('');
  const [draftTrustBadgesColumns, setDraftTrustBadgesColumns] = useState(3);
  const [draftTrustBadgesItemsJson, setDraftTrustBadgesItemsJson] = useState('');
  const [draftMediaSplitTitle, setDraftMediaSplitTitle] = useState('');
  const [draftMediaSplitDescription, setDraftMediaSplitDescription] = useState('');
  const [draftMediaSplitBulletsJson, setDraftMediaSplitBulletsJson] = useState('');
  const [draftMediaSplitImageUrl, setDraftMediaSplitImageUrl] = useState('');
  const [draftMediaSplitImageAlt, setDraftMediaSplitImageAlt] = useState('');
  const [draftMediaSplitReverse, setDraftMediaSplitReverse] = useState(false);
  const [draftMediaSplitCtaText, setDraftMediaSplitCtaText] = useState('');
  const [draftMediaSplitCtaLink, setDraftMediaSplitCtaLink] = useState('');
  const [draftIconFeaturesTitle, setDraftIconFeaturesTitle] = useState('');
  const [draftIconFeaturesDescription, setDraftIconFeaturesDescription] = useState('');
  const [draftIconFeaturesColumns, setDraftIconFeaturesColumns] = useState(3);
  const [draftIconFeaturesItemsJson, setDraftIconFeaturesItemsJson] = useState('');
  const [draftChecklistStepsTitle, setDraftChecklistStepsTitle] = useState('');
  const [draftChecklistStepsDescription, setDraftChecklistStepsDescription] = useState('');
  const [draftChecklistStepsItemsJson, setDraftChecklistStepsItemsJson] = useState('');
  const [draftQuoteHighlightQuote, setDraftQuoteHighlightQuote] = useState('');
  const [draftQuoteHighlightAuthor, setDraftQuoteHighlightAuthor] = useState('');
  const [draftQuoteHighlightRole, setDraftQuoteHighlightRole] = useState('');
  const [draftMilestonesTitle, setDraftMilestonesTitle] = useState('');
  const [draftMilestonesDescription, setDraftMilestonesDescription] = useState('');
  const [draftMilestonesItemsJson, setDraftMilestonesItemsJson] = useState('');
  const [draftDualCtaBandTitle, setDraftDualCtaBandTitle] = useState('');
  const [draftDualCtaBandDescription, setDraftDualCtaBandDescription] = useState('');
  const [draftDualCtaBandPrimaryText, setDraftDualCtaBandPrimaryText] = useState('');
  const [draftDualCtaBandPrimaryLink, setDraftDualCtaBandPrimaryLink] = useState('');
  const [draftDualCtaBandSecondaryText, setDraftDualCtaBandSecondaryText] = useState('');
  const [draftDualCtaBandSecondaryLink, setDraftDualCtaBandSecondaryLink] = useState('');
  const [draftKpiStripTitle, setDraftKpiStripTitle] = useState('');
  const [draftKpiStripItemsJson, setDraftKpiStripItemsJson] = useState('');
  const [draftImageQuoteQuote, setDraftImageQuoteQuote] = useState('');
  const [draftImageQuoteAuthor, setDraftImageQuoteAuthor] = useState('');
  const [draftImageQuoteRole, setDraftImageQuoteRole] = useState('');
  const [draftImageQuoteImageUrl, setDraftImageQuoteImageUrl] = useState('');
  const [draftImageQuoteImageAlt, setDraftImageQuoteImageAlt] = useState('');
  const [draftBenefitGridTitle, setDraftBenefitGridTitle] = useState('');
  const [draftBenefitGridDescription, setDraftBenefitGridDescription] = useState('');
  const [draftBenefitGridColumns, setDraftBenefitGridColumns] = useState(3);
  const [draftBenefitGridItemsJson, setDraftBenefitGridItemsJson] = useState('');
  const [draftMiniTimelineTitle, setDraftMiniTimelineTitle] = useState('');
  const [draftMiniTimelineDescription, setDraftMiniTimelineDescription] = useState('');
  const [draftMiniTimelineItemsJson, setDraftMiniTimelineItemsJson] = useState('');
  const [draftValueCardsTitle, setDraftValueCardsTitle] = useState('');
  const [draftValueCardsDescription, setDraftValueCardsDescription] = useState('');
  const [draftValueCardsColumns, setDraftValueCardsColumns] = useState(3);
  const [draftValueCardsItemsJson, setDraftValueCardsItemsJson] = useState('');
  const [draftQuickFactsTitle, setDraftQuickFactsTitle] = useState('');
  const [draftQuickFactsItemsJson, setDraftQuickFactsItemsJson] = useState('');
  const [draftFeatureBulletsTitle, setDraftFeatureBulletsTitle] = useState('');
  const [draftFeatureBulletsDescription, setDraftFeatureBulletsDescription] = useState('');
  const [draftFeatureBulletsItemsJson, setDraftFeatureBulletsItemsJson] = useState('');
  const [draftStatBannerValue, setDraftStatBannerValue] = useState('');
  const [draftStatBannerLabel, setDraftStatBannerLabel] = useState('');
  const [draftStatBannerSupportingText, setDraftStatBannerSupportingText] = useState('');

  useEffect(() => {
    if (!widget || !isOpen) return;
    
    const settings = widget.settings || {};
    setDraftVariant(widget.variant || 'default');
    setDraftEnabled(widget.enabled);
    setDraftLegacySectionId((settings.legacySectionId as string | undefined) || 'hero');
    setDraftAutoplay(Boolean(settings.autoplay ?? true));
    setDraftAutoplaySpeed(Number(settings.autoplaySpeed ?? 4000));
    setDraftShowMap(Boolean(settings.showMap ?? true));
    setDraftGridSource((settings.source as 'services' | 'portfolio') || 'services');
    setDraftGridColumns(Number(settings.columns ?? 3));
    setDraftGridMaxItems(Number(settings.maxItems ?? 6));
    setDraftGridTitle((settings.title as string | undefined) || '');
    setDraftGridDescription((settings.description as string | undefined) || '');
    setDraftCardListSource((settings.source as 'services' | 'portfolio') || 'services');
    setDraftCardListMaxItems(Number(settings.maxItems ?? 6));
    setDraftCardListTitle((settings.title as string | undefined) || '');
    setDraftCardListDescription((settings.description as string | undefined) || '');
    setDraftGalleryMaxItems(Number(settings.maxItems ?? 8));
    setDraftCtaTitle((settings.title as string | undefined) || '');
    setDraftCtaDescription((settings.description as string | undefined) || '');
    setDraftPrimaryButtonText((settings.primary_button_text as string | undefined) || '');
    setDraftPrimaryButtonLink((settings.primary_button_link as string | undefined) || '');
    setDraftSecondaryButtonText((settings.secondary_button_text as string | undefined) || '');
    setDraftSecondaryButtonLink((settings.secondary_button_link as string | undefined) || '');
    setDraftFormTitle((settings.title as string | undefined) || '');
    setDraftFormDescription((settings.description as string | undefined) || '');
    setDraftFormUrl((settings.formUrl as string | undefined) || '');
    setDraftFormCtaText((settings.ctaText as string | undefined) || '');
    setDraftFormCtaUrl((settings.ctaUrl as string | undefined) || '');
    setDraftFormHeight(Number(settings.height ?? 760));
    setDraftTestimonialsTitle((settings.title as string | undefined) || '');
    setDraftTestimonialsDescription((settings.description as string | undefined) || '');
    setDraftTestimonialsMaxItems(Number(settings.maxItems ?? 6));
    setDraftTestimonialsItemsJson(JSON.stringify(settings.items || [], null, 2));
    setDraftFaqTitle((settings.title as string | undefined) || '');
    setDraftFaqDescription((settings.description as string | undefined) || '');
    setDraftFaqItemsJson(JSON.stringify(settings.items || [], null, 2));
    setDraftStatsTitle((settings.title as string | undefined) || '');
    setDraftStatsDescription((settings.description as string | undefined) || '');
    setDraftStatsColumns(Number(settings.columns ?? 4));
    setDraftStatsItemsJson(JSON.stringify(settings.items || [], null, 2));
    setDraftProcessTitle((settings.title as string | undefined) || '');
    setDraftProcessDescription((settings.description as string | undefined) || '');
    setDraftProcessItemsJson(JSON.stringify(settings.items || [], null, 2));
    setDraftPricingTitle((settings.title as string | undefined) || '');
    setDraftPricingDescription((settings.description as string | undefined) || '');
    setDraftPricingPlansJson(JSON.stringify(settings.plans || [], null, 2));
    setDraftComparisonTitle((settings.title as string | undefined) || '');
    setDraftComparisonDescription((settings.description as string | undefined) || '');
    setDraftComparisonRowsJson(JSON.stringify(settings.rows || [], null, 2));
    setDraftLogosWallTitle((settings.title as string | undefined) || '');
    setDraftLogosWallDescription((settings.description as string | undefined) || '');
    setDraftLogosWallColumns(Number(settings.columns ?? 4));
    setDraftLogosWallItemsJson(JSON.stringify(settings.logos || [], null, 2));
    setDraftCaseHighlightsTitle((settings.title as string | undefined) || '');
    setDraftCaseHighlightsDescription((settings.description as string | undefined) || '');
    setDraftCaseHighlightsMaxItems(Number(settings.maxItems ?? 3));
    setDraftCaseHighlightsItemsJson(JSON.stringify(settings.cases || [], null, 2));
    setDraftBeforeAfterTitle((settings.title as string | undefined) || '');
    setDraftBeforeAfterDescription((settings.description as string | undefined) || '');
    setDraftBeforeAfterMaxItems(Number(settings.maxItems ?? 2));
    setDraftBeforeAfterItemsJson(JSON.stringify(settings.items || [], null, 2));
    setDraftFeatureTabsTitle((settings.title as string | undefined) || '');
    setDraftFeatureTabsDescription((settings.description as string | undefined) || '');
    setDraftFeatureTabsItemsJson(JSON.stringify(settings.items || [], null, 2));
    setDraftTeamCardsTitle((settings.title as string | undefined) || '');
    setDraftTeamCardsDescription((settings.description as string | undefined) || '');
    setDraftTeamCardsMaxItems(Number(settings.maxItems ?? 4));
    setDraftTeamCardsItemsJson(JSON.stringify(settings.items || [], null, 2));
    setDraftTrustBadgesTitle((settings.title as string | undefined) || '');
    setDraftTrustBadgesDescription((settings.description as string | undefined) || '');
    setDraftTrustBadgesColumns(Number(settings.columns ?? 3));
    setDraftTrustBadgesItemsJson(JSON.stringify(settings.items || [], null, 2));
    setDraftMediaSplitTitle((settings.title as string | undefined) || '');
    setDraftMediaSplitDescription((settings.description as string | undefined) || '');
    setDraftMediaSplitBulletsJson(JSON.stringify(settings.bullets || [], null, 2));
    setDraftMediaSplitImageUrl((settings.imageUrl as string | undefined) || '');
    setDraftMediaSplitImageAlt((settings.imageAlt as string | undefined) || '');
    setDraftMediaSplitReverse(Boolean(settings.reverse ?? false));
    setDraftMediaSplitCtaText((settings.ctaText as string | undefined) || '');
    setDraftMediaSplitCtaLink((settings.ctaLink as string | undefined) || '');
    setDraftIconFeaturesTitle((settings.title as string | undefined) || '');
    setDraftIconFeaturesDescription((settings.description as string | undefined) || '');
    setDraftIconFeaturesColumns(Number(settings.columns ?? 3));
    setDraftIconFeaturesItemsJson(JSON.stringify(settings.items || [], null, 2));
    setDraftChecklistStepsTitle((settings.title as string | undefined) || '');
    setDraftChecklistStepsDescription((settings.description as string | undefined) || '');
    setDraftChecklistStepsItemsJson(JSON.stringify(settings.items || [], null, 2));
    setDraftQuoteHighlightQuote((settings.quote as string | undefined) || '');
    setDraftQuoteHighlightAuthor((settings.author as string | undefined) || '');
    setDraftQuoteHighlightRole((settings.role as string | undefined) || '');
    setDraftMilestonesTitle((settings.title as string | undefined) || '');
    setDraftMilestonesDescription((settings.description as string | undefined) || '');
    setDraftMilestonesItemsJson(JSON.stringify(settings.items || [], null, 2));
    setDraftDualCtaBandTitle((settings.title as string | undefined) || '');
    setDraftDualCtaBandDescription((settings.description as string | undefined) || '');
    setDraftDualCtaBandPrimaryText((settings.primaryText as string | undefined) || '');
    setDraftDualCtaBandPrimaryLink((settings.primaryLink as string | undefined) || '');
    setDraftDualCtaBandSecondaryText((settings.secondaryText as string | undefined) || '');
    setDraftDualCtaBandSecondaryLink((settings.secondaryLink as string | undefined) || '');
    setDraftKpiStripTitle((settings.title as string | undefined) || '');
    setDraftKpiStripItemsJson(JSON.stringify(settings.items || [], null, 2));
    setDraftImageQuoteQuote((settings.quote as string | undefined) || '');
    setDraftImageQuoteAuthor((settings.author as string | undefined) || '');
    setDraftImageQuoteRole((settings.role as string | undefined) || '');
    setDraftImageQuoteImageUrl((settings.imageUrl as string | undefined) || '');
    setDraftImageQuoteImageAlt((settings.imageAlt as string | undefined) || '');
    setDraftBenefitGridTitle((settings.title as string | undefined) || '');
    setDraftBenefitGridDescription((settings.description as string | undefined) || '');
    setDraftBenefitGridColumns(Number(settings.columns ?? 3));
    setDraftBenefitGridItemsJson(JSON.stringify(settings.items || [], null, 2));
    setDraftMiniTimelineTitle((settings.title as string | undefined) || '');
    setDraftMiniTimelineDescription((settings.description as string | undefined) || '');
    setDraftMiniTimelineItemsJson(JSON.stringify(settings.items || [], null, 2));
    setDraftValueCardsTitle((settings.title as string | undefined) || '');
    setDraftValueCardsDescription((settings.description as string | undefined) || '');
    setDraftValueCardsColumns(Number(settings.columns ?? 3));
    setDraftValueCardsItemsJson(JSON.stringify(settings.items || [], null, 2));
    setDraftQuickFactsTitle((settings.title as string | undefined) || '');
    setDraftQuickFactsItemsJson(JSON.stringify(settings.items || [], null, 2));
    setDraftFeatureBulletsTitle((settings.title as string | undefined) || '');
    setDraftFeatureBulletsDescription((settings.description as string | undefined) || '');
    setDraftFeatureBulletsItemsJson(JSON.stringify(settings.bullets || [], null, 2));
    setDraftStatBannerValue((settings.value as string | undefined) || '');
    setDraftStatBannerLabel((settings.label as string | undefined) || '');
    setDraftStatBannerSupportingText((settings.supportingText as string | undefined) || '');

  }, [widget, isOpen]);

  if (!isOpen || !widget) return null;

  const handleSave = () => {
    let settings: Record<string, unknown> = {};

    try {
      if (widget.widgetType === 'legacy-section') {
        settings = {
          legacySectionId: draftLegacySectionId,
          ...(draftLegacySectionId === 'services' || draftLegacySectionId === 'projects'
            ? { autoplay: draftAutoplay, autoplaySpeed: draftAutoplaySpeed }
            : {}),
          ...(draftLegacySectionId === 'contact' ? { showMap: draftShowMap } : {}),
        };
      } else if (widget.widgetType === 'grid') {
        settings = {
          source: draftGridSource,
          columns: draftGridColumns,
          maxItems: draftGridMaxItems,
          title: draftGridTitle,
          description: draftGridDescription,
        };
      } else if (widget.widgetType === 'card-list') {
        settings = {
          source: draftCardListSource,
          maxItems: draftCardListMaxItems,
          title: draftCardListTitle,
          description: draftCardListDescription,
        };
      } else if (widget.widgetType === 'gallery') {
        settings = { maxItems: draftGalleryMaxItems };
      } else if (widget.widgetType === 'form-embed') {
        settings = {
          title: draftFormTitle,
          description: draftFormDescription,
          formUrl: draftFormUrl,
          ctaText: draftFormCtaText,
          ctaUrl: draftFormCtaUrl,
          height: draftFormHeight,
        };
      } else if (widget.widgetType === 'testimonials') {
        settings = {
          title: draftTestimonialsTitle,
          description: draftTestimonialsDescription,
          maxItems: draftTestimonialsMaxItems,
          items: draftTestimonialsItemsJson ? JSON.parse(draftTestimonialsItemsJson) : [],
        };
      } else if (widget.widgetType === 'faq') {
        settings = {
          title: draftFaqTitle,
          description: draftFaqDescription,
          items: draftFaqItemsJson ? JSON.parse(draftFaqItemsJson) : [],
        };
      } else if (widget.widgetType === 'stats') {
        settings = {
          title: draftStatsTitle,
          description: draftStatsDescription,
          columns: draftStatsColumns,
          items: draftStatsItemsJson ? JSON.parse(draftStatsItemsJson) : [],
        };
      } else if (widget.widgetType === 'process') {
        settings = {
          title: draftProcessTitle,
          description: draftProcessDescription,
          items: draftProcessItemsJson ? JSON.parse(draftProcessItemsJson) : [],
        };
      } else if (widget.widgetType === 'pricing') {
        settings = {
          title: draftPricingTitle,
          description: draftPricingDescription,
          plans: draftPricingPlansJson ? JSON.parse(draftPricingPlansJson) : [],
        };
      } else if (widget.widgetType === 'comparison') {
        settings = {
          title: draftComparisonTitle,
          description: draftComparisonDescription,
          rows: draftComparisonRowsJson ? JSON.parse(draftComparisonRowsJson) : [],
        };
      } else if (widget.widgetType === 'logos-wall') {
        settings = {
          title: draftLogosWallTitle,
          description: draftLogosWallDescription,
          columns: draftLogosWallColumns,
          logos: draftLogosWallItemsJson ? JSON.parse(draftLogosWallItemsJson) : [],
        };
      } else if (widget.widgetType === 'case-highlights') {
        settings = {
          title: draftCaseHighlightsTitle,
          description: draftCaseHighlightsDescription,
          maxItems: draftCaseHighlightsMaxItems,
          cases: draftCaseHighlightsItemsJson ? JSON.parse(draftCaseHighlightsItemsJson) : [],
        };
      } else if (widget.widgetType === 'before-after') {
        settings = {
          title: draftBeforeAfterTitle,
          description: draftBeforeAfterDescription,
          maxItems: draftBeforeAfterMaxItems,
          items: draftBeforeAfterItemsJson ? JSON.parse(draftBeforeAfterItemsJson) : [],
        };
      } else if (widget.widgetType === 'feature-tabs') {
        settings = {
          title: draftFeatureTabsTitle,
          description: draftFeatureTabsDescription,
          items: draftFeatureTabsItemsJson ? JSON.parse(draftFeatureTabsItemsJson) : [],
        };
      } else if (widget.widgetType === 'team-cards') {
        settings = {
          title: draftTeamCardsTitle,
          description: draftTeamCardsDescription,
          maxItems: draftTeamCardsMaxItems,
          items: draftTeamCardsItemsJson ? JSON.parse(draftTeamCardsItemsJson) : [],
        };
      } else if (widget.widgetType === 'trust-badges') {
        settings = {
          title: draftTrustBadgesTitle,
          description: draftTrustBadgesDescription,
          columns: draftTrustBadgesColumns,
          items: draftTrustBadgesItemsJson ? JSON.parse(draftTrustBadgesItemsJson) : [],
        };
      } else if (widget.widgetType === 'media-split') {
        settings = {
          title: draftMediaSplitTitle,
          description: draftMediaSplitDescription,
          bullets: draftMediaSplitBulletsJson ? JSON.parse(draftMediaSplitBulletsJson) : [],
          imageUrl: draftMediaSplitImageUrl,
          imageAlt: draftMediaSplitImageAlt,
          reverse: draftMediaSplitReverse,
          ctaText: draftMediaSplitCtaText,
          ctaLink: draftMediaSplitCtaLink,
        };
      } else if (widget.widgetType === 'icon-features') {
        settings = {
          title: draftIconFeaturesTitle,
          description: draftIconFeaturesDescription,
          columns: draftIconFeaturesColumns,
          items: draftIconFeaturesItemsJson ? JSON.parse(draftIconFeaturesItemsJson) : [],
        };
      } else if (widget.widgetType === 'checklist-steps') {
        settings = {
          title: draftChecklistStepsTitle,
          description: draftChecklistStepsDescription,
          items: draftChecklistStepsItemsJson ? JSON.parse(draftChecklistStepsItemsJson) : [],
        };
      } else if (widget.widgetType === 'quote-highlight') {
        settings = {
          quote: draftQuoteHighlightQuote,
          author: draftQuoteHighlightAuthor,
          role: draftQuoteHighlightRole,
        };
      } else if (widget.widgetType === 'milestones') {
        settings = {
          title: draftMilestonesTitle,
          description: draftMilestonesDescription,
          items: draftMilestonesItemsJson ? JSON.parse(draftMilestonesItemsJson) : [],
        };
      } else if (widget.widgetType === 'dual-cta-band') {
        settings = {
          title: draftDualCtaBandTitle,
          description: draftDualCtaBandDescription,
          primaryText: draftDualCtaBandPrimaryText,
          primaryLink: draftDualCtaBandPrimaryLink,
          secondaryText: draftDualCtaBandSecondaryText,
          secondaryLink: draftDualCtaBandSecondaryLink,
        };
      } else if (widget.widgetType === 'kpi-strip') {
        settings = {
          title: draftKpiStripTitle,
          items: draftKpiStripItemsJson ? JSON.parse(draftKpiStripItemsJson) : [],
        };
      } else if (widget.widgetType === 'image-quote') {
        settings = {
          quote: draftImageQuoteQuote,
          author: draftImageQuoteAuthor,
          role: draftImageQuoteRole,
          imageUrl: draftImageQuoteImageUrl,
          imageAlt: draftImageQuoteImageAlt,
        };
      } else if (widget.widgetType === 'benefit-grid') {
        settings = {
          title: draftBenefitGridTitle,
          description: draftBenefitGridDescription,
          columns: draftBenefitGridColumns,
          items: draftBenefitGridItemsJson ? JSON.parse(draftBenefitGridItemsJson) : [],
        };
      } else if (widget.widgetType === 'mini-timeline') {
        settings = {
          title: draftMiniTimelineTitle,
          description: draftMiniTimelineDescription,
          items: draftMiniTimelineItemsJson ? JSON.parse(draftMiniTimelineItemsJson) : [],
        };
      } else if (widget.widgetType === 'value-cards') {
        settings = {
          title: draftValueCardsTitle,
          description: draftValueCardsDescription,
          columns: draftValueCardsColumns,
          items: draftValueCardsItemsJson ? JSON.parse(draftValueCardsItemsJson) : [],
        };
      } else if (widget.widgetType === 'quick-facts') {
        settings = {
          title: draftQuickFactsTitle,
          items: draftQuickFactsItemsJson ? JSON.parse(draftQuickFactsItemsJson) : [],
        };
      } else if (widget.widgetType === 'feature-bullets') {
        settings = {
          title: draftFeatureBulletsTitle,
          description: draftFeatureBulletsDescription,
          bullets: draftFeatureBulletsItemsJson ? JSON.parse(draftFeatureBulletsItemsJson) : [],
        };
      } else if (widget.widgetType === 'stat-banner') {
        settings = {
          value: draftStatBannerValue,
          label: draftStatBannerLabel,
          supportingText: draftStatBannerSupportingText,
        };
      } else if (widget.widgetType === 'cta') {
        settings = {
          title: draftCtaTitle,
          description: draftCtaDescription,
          primary_button_text: draftPrimaryButtonText,
          primary_button_link: draftPrimaryButtonLink,
          secondary_button_text: draftSecondaryButtonText,
          secondary_button_link: draftSecondaryButtonLink,
        };
      }
      
      onSave(widget.id, draftVariant, draftEnabled, settings);
      onClose();
    } catch (e) {
      console.error('Invalid JSON config', e);
      alert('Erro ao salvar as configurações. Verifique o formato JSON (se aplicável).');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" data-testid="widget-settings-modal-overlay">
      <div className="bg-white w-full max-w-2xl max-h-[90vh] rounded-xl shadow-xl flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Configurações do Elemento</h3>
            <p className="text-sm text-gray-500">Defina o comportamento e o visual deste widget.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            data-testid="close-widget-settings-modal"
            className="p-2 rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-700"
          >
            <X size={18} />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Variante</label>
              <input
                value={draftVariant}
                onChange={(e) => setDraftVariant(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                data-testid="widget-variant-input"
              />
              <p className="text-xs text-gray-500 mt-1">Nome da variação de design a ser usada.</p>
            </div>

            <div className="flex items-center gap-2">
              <input
                id="widget-enabled-modal"
                type="checkbox"
                checked={draftEnabled}
                onChange={(e) => setDraftEnabled(e.target.checked)}
                data-testid="widget-enabled-input"
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="widget-enabled-modal" className="text-sm font-medium text-gray-700">
                Elemento habilitado
              </label>
            </div>
          </div>
          
          <div className="border-t border-gray-200 pt-6 space-y-4">
            <h4 className="text-md font-medium text-gray-800">Opções Específicas</h4>
            
            {widget.widgetType === 'legacy-section' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Seção Legada</label>
                  <select
                    value={draftLegacySectionId}
                    onChange={(e) => setDraftLegacySectionId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    data-testid="widget-legacy-section-select"
                  >
                    <option value="hero">Banner Principal</option>
                    <option value="services">Serviços</option>
                    <option value="projects">Projetos</option>
                    <option value="about">Sobre Nós</option>
                    <option value="partners">Parceiros</option>
                    <option value="contact">Contato</option>
                  </select>
                </div>

                {(draftLegacySectionId === 'services' || draftLegacySectionId === 'projects') && (
                  <>
                    <div className="flex items-center gap-2">
                      <input
                        id="widget-autoplay-modal"
                        type="checkbox"
                        checked={draftAutoplay}
                        onChange={(e) => setDraftAutoplay(e.target.checked)}
                        data-testid="widget-autoplay-input"
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <label htmlFor="widget-autoplay-modal" className="text-sm text-gray-700">
                        Autoplay
                      </label>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Velocidade do autoplay (ms)</label>
                      <input
                        type="number"
                        value={draftAutoplaySpeed}
                        onChange={(e) => setDraftAutoplaySpeed(Number(e.target.value || 4000))}
                        min={1000}
                        step={500}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        data-testid="widget-autoplay-speed-input"
                      />
                    </div>
                  </>
                )}

                {draftLegacySectionId === 'contact' && (
                  <div className="flex items-center gap-2">
                    <input
                      id="widget-show-map-modal"
                      type="checkbox"
                      checked={draftShowMap}
                      onChange={(e) => setDraftShowMap(e.target.checked)}
                      data-testid="widget-show-map-input"
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="widget-show-map-modal" className="text-sm text-gray-700">
                      Exibir mapa
                    </label>
                  </div>
                )}
              </>
            )}

            {widget.widgetType === 'gallery' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Máximo de itens</label>
                <input
                  type="number"
                  min={1}
                  value={draftGalleryMaxItems}
                  onChange={(e) => setDraftGalleryMaxItems(Number(e.target.value || 8))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  data-testid="widget-gallery-max-items-input"
                />
              </div>
            )}

            {widget.widgetType === 'grid' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fonte dos dados</label>
                  <select
                    value={draftGridSource}
                    onChange={(e) => setDraftGridSource(e.target.value as 'services' | 'portfolio')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    data-testid="widget-grid-source-input"
                  >
                    <option value="services">Services</option>
                    <option value="portfolio">Portfolio</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Colunas</label>
                  <select
                    value={draftGridColumns}
                    onChange={(e) => setDraftGridColumns(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    data-testid="widget-grid-columns-input"
                  >
                    <option value={2}>2</option>
                    <option value={3}>3</option>
                    <option value={4}>4</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Máximo de itens</label>
                  <input
                    type="number"
                    min={1}
                    value={draftGridMaxItems}
                    onChange={(e) => setDraftGridMaxItems(Number(e.target.value || 6))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    data-testid="widget-grid-max-items-input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                  <input
                    type="text"
                    value={draftGridTitle}
                    onChange={(e) => setDraftGridTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    data-testid="widget-grid-title-input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                  <textarea
                    value={draftGridDescription}
                    onChange={(e) => setDraftGridDescription(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    data-testid="widget-grid-description-input"
                  />
                </div>
              </>
            )}

            {widget.widgetType === 'card-list' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fonte dos dados</label>
                  <select
                    value={draftCardListSource}
                    onChange={(e) => setDraftCardListSource(e.target.value as 'services' | 'portfolio')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    data-testid="widget-card-list-source-input"
                  >
                    <option value="services">Services</option>
                    <option value="portfolio">Portfolio</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Máximo de itens</label>
                  <input
                    type="number"
                    min={1}
                    value={draftCardListMaxItems}
                    onChange={(e) => setDraftCardListMaxItems(Number(e.target.value || 6))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    data-testid="widget-card-list-max-items-input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                  <input
                    type="text"
                    value={draftCardListTitle}
                    onChange={(e) => setDraftCardListTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    data-testid="widget-card-list-title-input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                  <textarea
                    value={draftCardListDescription}
                    onChange={(e) => setDraftCardListDescription(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    data-testid="widget-card-list-description-input"
                  />
                </div>
              </>
            )}

            {widget.widgetType === 'form-embed' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                  <input
                    type="text"
                    value={draftFormTitle}
                    onChange={(e) => setDraftFormTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    data-testid="widget-form-embed-title-input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                  <textarea
                    value={draftFormDescription}
                    onChange={(e) => setDraftFormDescription(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    data-testid="widget-form-embed-description-input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">URL do Formulário Embed</label>
                  <input
                    type="text"
                    value={draftFormUrl}
                    onChange={(e) => setDraftFormUrl(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    data-testid="widget-form-embed-url-input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Texto do CTA</label>
                  <input
                    type="text"
                    value={draftFormCtaText}
                    onChange={(e) => setDraftFormCtaText(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    data-testid="widget-form-embed-cta-text-input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">URL do CTA</label>
                  <input
                    type="text"
                    value={draftFormCtaUrl}
                    onChange={(e) => setDraftFormCtaUrl(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    data-testid="widget-form-embed-cta-url-input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Altura (px)</label>
                  <input
                    type="number"
                    value={draftFormHeight}
                    onChange={(e) => setDraftFormHeight(Number(e.target.value || 760))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    data-testid="widget-form-embed-height-input"
                  />
                </div>
              </>
            )}

            {widget.widgetType === 'testimonials' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                  <input
                    type="text"
                    value={draftTestimonialsTitle}
                    onChange={(e) => setDraftTestimonialsTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    data-testid="widget-testimonials-title-input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                  <textarea
                    value={draftTestimonialsDescription}
                    onChange={(e) => setDraftTestimonialsDescription(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    data-testid="widget-testimonials-description-input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Máximo de itens</label>
                  <input
                    type="number"
                    min={1}
                    value={draftTestimonialsMaxItems}
                    onChange={(e) => setDraftTestimonialsMaxItems(Number(e.target.value || 6))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    data-testid="widget-testimonials-max-items-input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Depoimentos (JSON)</label>
                  <textarea
                    value={draftTestimonialsItemsJson}
                    onChange={(e) => setDraftTestimonialsItemsJson(e.target.value)}
                    rows={8}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                    data-testid="widget-testimonials-items-json-input"
                  />
                </div>
              </>
            )}

            {widget.widgetType === 'faq' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                  <input
                    type="text"
                    value={draftFaqTitle}
                    onChange={(e) => setDraftFaqTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    data-testid="widget-faq-title-input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                  <textarea
                    value={draftFaqDescription}
                    onChange={(e) => setDraftFaqDescription(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    data-testid="widget-faq-description-input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Perguntas (JSON)</label>
                  <textarea
                    value={draftFaqItemsJson}
                    onChange={(e) => setDraftFaqItemsJson(e.target.value)}
                    rows={8}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                    data-testid="widget-faq-items-json-input"
                  />
                </div>
              </>
            )}

            {widget.widgetType === 'stats' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                  <input
                    type="text"
                    value={draftStatsTitle}
                    onChange={(e) => setDraftStatsTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    data-testid="widget-stats-title-input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                  <textarea
                    value={draftStatsDescription}
                    onChange={(e) => setDraftStatsDescription(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    data-testid="widget-stats-description-input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Colunas</label>
                  <select
                    value={draftStatsColumns}
                    onChange={(e) => setDraftStatsColumns(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    data-testid="widget-stats-columns-input"
                  >
                    <option value={2}>2</option>
                    <option value={3}>3</option>
                    <option value={4}>4</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Métricas (JSON)</label>
                  <textarea
                    value={draftStatsItemsJson}
                    onChange={(e) => setDraftStatsItemsJson(e.target.value)}
                    rows={8}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                    data-testid="widget-stats-items-json-input"
                  />
                </div>
              </>
            )}

            {widget.widgetType === 'process' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                  <input
                    type="text"
                    value={draftProcessTitle}
                    onChange={(e) => setDraftProcessTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    data-testid="widget-process-title-input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                  <textarea
                    value={draftProcessDescription}
                    onChange={(e) => setDraftProcessDescription(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    data-testid="widget-process-description-input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Etapas (JSON)</label>
                  <textarea
                    value={draftProcessItemsJson}
                    onChange={(e) => setDraftProcessItemsJson(e.target.value)}
                    rows={8}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                    data-testid="widget-process-items-json-input"
                  />
                </div>
              </>
            )}

            {widget.widgetType === 'pricing' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                  <input
                    type="text"
                    value={draftPricingTitle}
                    onChange={(e) => setDraftPricingTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    data-testid="widget-pricing-title-input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                  <textarea
                    value={draftPricingDescription}
                    onChange={(e) => setDraftPricingDescription(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    data-testid="widget-pricing-description-input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Planos (JSON)</label>
                  <textarea
                    value={draftPricingPlansJson}
                    onChange={(e) => setDraftPricingPlansJson(e.target.value)}
                    rows={8}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                    data-testid="widget-pricing-plans-json-input"
                  />
                </div>
              </>
            )}

            {widget.widgetType === 'comparison' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                  <input
                    type="text"
                    value={draftComparisonTitle}
                    onChange={(e) => setDraftComparisonTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    data-testid="widget-comparison-title-input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                  <textarea
                    value={draftComparisonDescription}
                    onChange={(e) => setDraftComparisonDescription(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    data-testid="widget-comparison-description-input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Linhas (JSON)</label>
                  <textarea
                    value={draftComparisonRowsJson}
                    onChange={(e) => setDraftComparisonRowsJson(e.target.value)}
                    rows={8}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                    data-testid="widget-comparison-rows-json-input"
                  />
                </div>
              </>
            )}

            {widget.widgetType === 'logos-wall' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                  <input
                    type="text"
                    value={draftLogosWallTitle}
                    onChange={(e) => setDraftLogosWallTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    data-testid="widget-logos-wall-title-input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                  <textarea
                    value={draftLogosWallDescription}
                    onChange={(e) => setDraftLogosWallDescription(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    data-testid="widget-logos-wall-description-input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Colunas</label>
                  <select
                    value={draftLogosWallColumns}
                    onChange={(e) => setDraftLogosWallColumns(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    data-testid="widget-logos-wall-columns-input"
                  >
                    <option value={2}>2</option>
                    <option value={3}>3</option>
                    <option value={4}>4</option>
                    <option value={5}>5</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Logos (JSON)</label>
                  <textarea
                    value={draftLogosWallItemsJson}
                    onChange={(e) => setDraftLogosWallItemsJson(e.target.value)}
                    rows={8}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                    data-testid="widget-logos-wall-items-json-input"
                  />
                </div>
              </>
            )}

            {widget.widgetType === 'case-highlights' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                  <input
                    type="text"
                    value={draftCaseHighlightsTitle}
                    onChange={(e) => setDraftCaseHighlightsTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    data-testid="widget-case-highlights-title-input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                  <textarea
                    value={draftCaseHighlightsDescription}
                    onChange={(e) => setDraftCaseHighlightsDescription(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    data-testid="widget-case-highlights-description-input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Máximo de itens</label>
                  <input
                    type="number"
                    min={1}
                    value={draftCaseHighlightsMaxItems}
                    onChange={(e) => setDraftCaseHighlightsMaxItems(Number(e.target.value || 3))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    data-testid="widget-case-highlights-max-items-input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cases (JSON)</label>
                  <textarea
                    value={draftCaseHighlightsItemsJson}
                    onChange={(e) => setDraftCaseHighlightsItemsJson(e.target.value)}
                    rows={8}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                    data-testid="widget-case-highlights-items-json-input"
                  />
                </div>
              </>
            )}

            {widget.widgetType === 'before-after' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                  <input
                    type="text"
                    value={draftBeforeAfterTitle}
                    onChange={(e) => setDraftBeforeAfterTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    data-testid="widget-before-after-title-input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                  <textarea
                    value={draftBeforeAfterDescription}
                    onChange={(e) => setDraftBeforeAfterDescription(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    data-testid="widget-before-after-description-input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Máximo de itens</label>
                  <input
                    type="number"
                    min={1}
                    value={draftBeforeAfterMaxItems}
                    onChange={(e) => setDraftBeforeAfterMaxItems(Number(e.target.value || 2))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    data-testid="widget-before-after-max-items-input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Itens (JSON)</label>
                  <textarea
                    value={draftBeforeAfterItemsJson}
                    onChange={(e) => setDraftBeforeAfterItemsJson(e.target.value)}
                    rows={8}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                    data-testid="widget-before-after-items-json-input"
                  />
                </div>
              </>
            )}

            {widget.widgetType === 'feature-tabs' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                  <input
                    type="text"
                    value={draftFeatureTabsTitle}
                    onChange={(e) => setDraftFeatureTabsTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    data-testid="widget-feature-tabs-title-input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                  <textarea
                    value={draftFeatureTabsDescription}
                    onChange={(e) => setDraftFeatureTabsDescription(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    data-testid="widget-feature-tabs-description-input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Abas (JSON)</label>
                  <textarea
                    value={draftFeatureTabsItemsJson}
                    onChange={(e) => setDraftFeatureTabsItemsJson(e.target.value)}
                    rows={8}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                    data-testid="widget-feature-tabs-items-json-input"
                  />
                </div>
              </>
            )}

            {widget.widgetType === 'team-cards' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                  <input
                    type="text"
                    value={draftTeamCardsTitle}
                    onChange={(e) => setDraftTeamCardsTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    data-testid="widget-team-cards-title-input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                  <textarea
                    value={draftTeamCardsDescription}
                    onChange={(e) => setDraftTeamCardsDescription(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    data-testid="widget-team-cards-description-input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Máximo de itens</label>
                  <input
                    type="number"
                    min={1}
                    value={draftTeamCardsMaxItems}
                    onChange={(e) => setDraftTeamCardsMaxItems(Number(e.target.value || 4))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    data-testid="widget-team-cards-max-items-input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Membros (JSON)</label>
                  <textarea
                    value={draftTeamCardsItemsJson}
                    onChange={(e) => setDraftTeamCardsItemsJson(e.target.value)}
                    rows={8}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                    data-testid="widget-team-cards-items-json-input"
                  />
                </div>
              </>
            )}

            {widget.widgetType === 'trust-badges' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                  <input
                    type="text"
                    value={draftTrustBadgesTitle}
                    onChange={(e) => setDraftTrustBadgesTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    data-testid="widget-trust-badges-title-input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                  <textarea
                    value={draftTrustBadgesDescription}
                    onChange={(e) => setDraftTrustBadgesDescription(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    data-testid="widget-trust-badges-description-input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Colunas</label>
                  <select
                    value={draftTrustBadgesColumns}
                    onChange={(e) => setDraftTrustBadgesColumns(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    data-testid="widget-trust-badges-columns-input"
                  >
                    <option value={2}>2</option>
                    <option value={3}>3</option>
                    <option value={4}>4</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Selos (JSON)</label>
                  <textarea
                    value={draftTrustBadgesItemsJson}
                    onChange={(e) => setDraftTrustBadgesItemsJson(e.target.value)}
                    rows={8}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                    data-testid="widget-trust-badges-items-json-input"
                  />
                </div>
              </>
            )}

            {widget.widgetType === 'media-split' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                  <input
                    type="text"
                    value={draftMediaSplitTitle}
                    onChange={(e) => setDraftMediaSplitTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    data-testid="widget-media-split-title-input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                  <textarea
                    value={draftMediaSplitDescription}
                    onChange={(e) => setDraftMediaSplitDescription(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    data-testid="widget-media-split-description-input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bullets (JSON)</label>
                  <textarea
                    value={draftMediaSplitBulletsJson}
                    onChange={(e) => setDraftMediaSplitBulletsJson(e.target.value)}
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                    data-testid="widget-media-split-bullets-json-input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Imagem URL</label>
                  <input
                    type="text"
                    value={draftMediaSplitImageUrl}
                    onChange={(e) => setDraftMediaSplitImageUrl(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    data-testid="widget-media-split-image-url-input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Imagem Alt</label>
                  <input
                    type="text"
                    value={draftMediaSplitImageAlt}
                    onChange={(e) => setDraftMediaSplitImageAlt(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    data-testid="widget-media-split-image-alt-input"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    id="widget-media-split-reverse"
                    type="checkbox"
                    checked={draftMediaSplitReverse}
                    onChange={(e) => setDraftMediaSplitReverse(e.target.checked)}
                    data-testid="widget-media-split-reverse-input"
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="widget-media-split-reverse" className="text-sm text-gray-700">
                    Reverter Layout (Imagem na Esquerda)
                  </label>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Texto CTA</label>
                  <input
                    type="text"
                    value={draftMediaSplitCtaText}
                    onChange={(e) => setDraftMediaSplitCtaText(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    data-testid="widget-media-split-cta-text-input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Link CTA</label>
                  <input
                    type="text"
                    value={draftMediaSplitCtaLink}
                    onChange={(e) => setDraftMediaSplitCtaLink(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    data-testid="widget-media-split-cta-link-input"
                  />
                </div>
              </>
            )}

            {widget.widgetType === 'icon-features' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                  <input
                    type="text"
                    value={draftIconFeaturesTitle}
                    onChange={(e) => setDraftIconFeaturesTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    data-testid="widget-icon-features-title-input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                  <textarea
                    value={draftIconFeaturesDescription}
                    onChange={(e) => setDraftIconFeaturesDescription(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    data-testid="widget-icon-features-description-input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Colunas</label>
                  <select
                    value={draftIconFeaturesColumns}
                    onChange={(e) => setDraftIconFeaturesColumns(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    data-testid="widget-icon-features-columns-input"
                  >
                    <option value={2}>2</option>
                    <option value={3}>3</option>
                    <option value={4}>4</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Itens (JSON)</label>
                  <textarea
                    value={draftIconFeaturesItemsJson}
                    onChange={(e) => setDraftIconFeaturesItemsJson(e.target.value)}
                    rows={8}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                    data-testid="widget-icon-features-items-json-input"
                  />
                </div>
              </>
            )}

            {widget.widgetType === 'checklist-steps' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                  <input
                    type="text"
                    value={draftChecklistStepsTitle}
                    onChange={(e) => setDraftChecklistStepsTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    data-testid="widget-checklist-steps-title-input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                  <textarea
                    value={draftChecklistStepsDescription}
                    onChange={(e) => setDraftChecklistStepsDescription(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    data-testid="widget-checklist-steps-description-input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Itens (JSON)</label>
                  <textarea
                    value={draftChecklistStepsItemsJson}
                    onChange={(e) => setDraftChecklistStepsItemsJson(e.target.value)}
                    rows={8}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                    data-testid="widget-checklist-steps-items-json-input"
                  />
                </div>
              </>
            )}

            {widget.widgetType === 'quote-highlight' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Citação</label>
                  <textarea
                    value={draftQuoteHighlightQuote}
                    onChange={(e) => setDraftQuoteHighlightQuote(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    data-testid="widget-quote-highlight-quote-input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Autor</label>
                  <input
                    type="text"
                    value={draftQuoteHighlightAuthor}
                    onChange={(e) => setDraftQuoteHighlightAuthor(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    data-testid="widget-quote-highlight-author-input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cargo</label>
                  <input
                    type="text"
                    value={draftQuoteHighlightRole}
                    onChange={(e) => setDraftQuoteHighlightRole(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    data-testid="widget-quote-highlight-role-input"
                  />
                </div>
              </>
            )}

            {widget.widgetType === 'milestones' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                  <input
                    type="text"
                    value={draftMilestonesTitle}
                    onChange={(e) => setDraftMilestonesTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    data-testid="widget-milestones-title-input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                  <textarea
                    value={draftMilestonesDescription}
                    onChange={(e) => setDraftMilestonesDescription(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    data-testid="widget-milestones-description-input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Marcos (JSON)</label>
                  <textarea
                    value={draftMilestonesItemsJson}
                    onChange={(e) => setDraftMilestonesItemsJson(e.target.value)}
                    rows={8}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                    data-testid="widget-milestones-items-json-input"
                  />
                </div>
              </>
            )}

            {widget.widgetType === 'dual-cta-band' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                  <input
                    type="text"
                    value={draftDualCtaBandTitle}
                    onChange={(e) => setDraftDualCtaBandTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    data-testid="widget-dual-cta-band-title-input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                  <textarea
                    value={draftDualCtaBandDescription}
                    onChange={(e) => setDraftDualCtaBandDescription(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    data-testid="widget-dual-cta-band-description-input"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Texto CTA Primário</label>
                    <input
                      type="text"
                      value={draftDualCtaBandPrimaryText}
                      onChange={(e) => setDraftDualCtaBandPrimaryText(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      data-testid="widget-dual-cta-band-primary-text-input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Link CTA Primário</label>
                    <input
                      type="text"
                      value={draftDualCtaBandPrimaryLink}
                      onChange={(e) => setDraftDualCtaBandPrimaryLink(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      data-testid="widget-dual-cta-band-primary-link-input"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Texto CTA Secundário</label>
                    <input
                      type="text"
                      value={draftDualCtaBandSecondaryText}
                      onChange={(e) => setDraftDualCtaBandSecondaryText(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      data-testid="widget-dual-cta-band-secondary-text-input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Link CTA Secundário</label>
                    <input
                      type="text"
                      value={draftDualCtaBandSecondaryLink}
                      onChange={(e) => setDraftDualCtaBandSecondaryLink(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      data-testid="widget-dual-cta-band-secondary-link-input"
                    />
                  </div>
                </div>
              </>
            )}

            {widget.widgetType === 'kpi-strip' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                  <input
                    type="text"
                    value={draftKpiStripTitle}
                    onChange={(e) => setDraftKpiStripTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    data-testid="widget-kpi-strip-title-input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">KPIs (JSON)</label>
                  <textarea
                    value={draftKpiStripItemsJson}
                    onChange={(e) => setDraftKpiStripItemsJson(e.target.value)}
                    rows={8}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                    data-testid="widget-kpi-strip-items-json-input"
                  />
                </div>
              </>
            )}

            {widget.widgetType === 'image-quote' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Citação</label>
                  <textarea
                    value={draftImageQuoteQuote}
                    onChange={(e) => setDraftImageQuoteQuote(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    data-testid="widget-image-quote-quote-input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Autor</label>
                  <input
                    type="text"
                    value={draftImageQuoteAuthor}
                    onChange={(e) => setDraftImageQuoteAuthor(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    data-testid="widget-image-quote-author-input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cargo</label>
                  <input
                    type="text"
                    value={draftImageQuoteRole}
                    onChange={(e) => setDraftImageQuoteRole(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    data-testid="widget-image-quote-role-input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Imagem URL</label>
                  <input
                    type="text"
                    value={draftImageQuoteImageUrl}
                    onChange={(e) => setDraftImageQuoteImageUrl(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    data-testid="widget-image-quote-image-url-input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Imagem Alt</label>
                  <input
                    type="text"
                    value={draftImageQuoteImageAlt}
                    onChange={(e) => setDraftImageQuoteImageAlt(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    data-testid="widget-image-quote-image-alt-input"
                  />
                </div>
              </>
            )}

            {widget.widgetType === 'benefit-grid' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                  <input
                    type="text"
                    value={draftBenefitGridTitle}
                    onChange={(e) => setDraftBenefitGridTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    data-testid="widget-benefit-grid-title-input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                  <textarea
                    value={draftBenefitGridDescription}
                    onChange={(e) => setDraftBenefitGridDescription(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    data-testid="widget-benefit-grid-description-input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Colunas</label>
                  <select
                    value={draftBenefitGridColumns}
                    onChange={(e) => setDraftBenefitGridColumns(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    data-testid="widget-benefit-grid-columns-input"
                  >
                    <option value={2}>2</option>
                    <option value={3}>3</option>
                    <option value={4}>4</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Itens (JSON)</label>
                  <textarea
                    value={draftBenefitGridItemsJson}
                    onChange={(e) => setDraftBenefitGridItemsJson(e.target.value)}
                    rows={8}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                    data-testid="widget-benefit-grid-items-json-input"
                  />
                </div>
              </>
            )}

            {widget.widgetType === 'mini-timeline' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                  <input
                    type="text"
                    value={draftMiniTimelineTitle}
                    onChange={(e) => setDraftMiniTimelineTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    data-testid="widget-mini-timeline-title-input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                  <textarea
                    value={draftMiniTimelineDescription}
                    onChange={(e) => setDraftMiniTimelineDescription(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    data-testid="widget-mini-timeline-description-input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Itens (JSON)</label>
                  <textarea
                    value={draftMiniTimelineItemsJson}
                    onChange={(e) => setDraftMiniTimelineItemsJson(e.target.value)}
                    rows={8}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                    data-testid="widget-mini-timeline-items-json-input"
                  />
                </div>
              </>
            )}

            {widget.widgetType === 'value-cards' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                  <input
                    type="text"
                    value={draftValueCardsTitle}
                    onChange={(e) => setDraftValueCardsTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    data-testid="widget-value-cards-title-input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                  <textarea
                    value={draftValueCardsDescription}
                    onChange={(e) => setDraftValueCardsDescription(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    data-testid="widget-value-cards-description-input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Colunas</label>
                  <select
                    value={draftValueCardsColumns}
                    onChange={(e) => setDraftValueCardsColumns(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    data-testid="widget-value-cards-columns-input"
                  >
                    <option value={2}>2</option>
                    <option value={3}>3</option>
                    <option value={4}>4</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Itens (JSON)</label>
                  <textarea
                    value={draftValueCardsItemsJson}
                    onChange={(e) => setDraftValueCardsItemsJson(e.target.value)}
                    rows={8}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                    data-testid="widget-value-cards-items-json-input"
                  />
                </div>
              </>
            )}

            {widget.widgetType === 'quick-facts' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                  <input
                    type="text"
                    value={draftQuickFactsTitle}
                    onChange={(e) => setDraftQuickFactsTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    data-testid="widget-quick-facts-title-input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Itens (JSON)</label>
                  <textarea
                    value={draftQuickFactsItemsJson}
                    onChange={(e) => setDraftQuickFactsItemsJson(e.target.value)}
                    rows={8}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                    data-testid="widget-quick-facts-items-json-input"
                  />
                </div>
              </>
            )}

            {widget.widgetType === 'feature-bullets' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                  <input
                    type="text"
                    value={draftFeatureBulletsTitle}
                    onChange={(e) => setDraftFeatureBulletsTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    data-testid="widget-feature-bullets-title-input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                  <textarea
                    value={draftFeatureBulletsDescription}
                    onChange={(e) => setDraftFeatureBulletsDescription(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    data-testid="widget-feature-bullets-description-input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bullets (JSON)</label>
                  <textarea
                    value={draftFeatureBulletsItemsJson}
                    onChange={(e) => setDraftFeatureBulletsItemsJson(e.target.value)}
                    rows={8}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                    data-testid="widget-feature-bullets-items-json-input"
                  />
                </div>
              </>
            )}

            {widget.widgetType === 'stat-banner' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Valor</label>
                  <input
                    type="text"
                    value={draftStatBannerValue}
                    onChange={(e) => setDraftStatBannerValue(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    data-testid="widget-stat-banner-value-input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Label</label>
                  <input
                    type="text"
                    value={draftStatBannerLabel}
                    onChange={(e) => setDraftStatBannerLabel(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    data-testid="widget-stat-banner-label-input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Texto de apoio</label>
                  <textarea
                    value={draftStatBannerSupportingText}
                    onChange={(e) => setDraftStatBannerSupportingText(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    data-testid="widget-stat-banner-supporting-text-input"
                  />
                </div>
              </>
            )}

            {widget.widgetType === 'cta' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                  <input
                    type="text"
                    value={draftCtaTitle}
                    onChange={(e) => setDraftCtaTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    data-testid="widget-cta-title-input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                  <textarea
                    value={draftCtaDescription}
                    onChange={(e) => setDraftCtaDescription(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    data-testid="widget-cta-description-input"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Texto Botão Primário</label>
                    <input
                      type="text"
                      value={draftPrimaryButtonText}
                      onChange={(e) => setDraftPrimaryButtonText(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      data-testid="widget-cta-primary-text-input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Link Botão Primário</label>
                    <input
                      type="text"
                      value={draftPrimaryButtonLink}
                      onChange={(e) => setDraftPrimaryButtonLink(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      data-testid="widget-cta-primary-link-input"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Texto Botão Secundário</label>
                    <input
                      type="text"
                      value={draftSecondaryButtonText}
                      onChange={(e) => setDraftSecondaryButtonText(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      data-testid="widget-cta-secondary-text-input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Link Botão Secundário</label>
                    <input
                      type="text"
                      value={draftSecondaryButtonLink}
                      onChange={(e) => setDraftSecondaryButtonLink(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      data-testid="widget-cta-secondary-link-input"
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
        
        <div className="flex items-center justify-end px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 mr-3"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-60"
            data-testid="widget-save-button"
          >
            <Save size={16} />
            Salvar Configurações
          </button>
        </div>
      </div>
    </div>
  );
};

export default WidgetSettingsModal;