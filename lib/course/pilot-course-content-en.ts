export interface PilotCourseContentEn {
  course_slug: string;
  title_en: string;
  subtitle_en: string;
  description_md_en: string;
  what_will_learn_en?: string;
  target_audience_en?: string;
}

/** Hero carousel + planlama vitrini pilot — 3 kurs */
export const PILOT_COURSE_CONTENT_EN: PilotCourseContentEn[] = [
  {
    course_slug:
      "musteri-taleplerini-verilere-dokmenin-yolu-stock-option-plan-tasarim-option-plan-ve-range-plan",
    title_en: "Stock Option Plan, Design Option Plan and Range Plan",
    subtitle_en:
      "Learn stock option planning, design option plans, and range planning for retail assortment and capacity decisions.",
    description_md_en: `This course is designed for professionals working in product management, collection planning, and strategic stock allocation—especially in retail.

You will learn the stock option concept, how planning is built around store capacity, and how these plans connect to design and product breadth.

Together we will analyse how **Option Plan** and **Range Plan** approaches ground decisions at the start of the season and throughout the season.

You will also learn to use the **Boston Matrix (BCG model)** to define products' strategic positions and decide which lines to support and which to exit—explained in a clear, practical way.

Supported by applied examples, industry insight, and field-tested methods, this course delivers decision systems you can use in daily operations—not theory alone.

### Who is this for?

- Planning, buying, product management, category management, and retail strategy teams
- Professionals in fashion, ready-to-wear, home textiles, and fast-moving consumer goods
- Design and R&D teams who want to contribute strategically to the collection process

### By the end of this course you will be able to:

- Plan the right product mix based on store capacity
- Shape stock distribution using customer insight and performance
- Interpret the option concept as a strategy—not only as units
- Evaluate your product portfolio objectively with the Boston Matrix
- Build range plans from data, not intuition

All sections are presented clearly with voice narration. Whether you are new to planning or an experienced specialist, this course gives you a structured perspective.`,
    what_will_learn_en: `Plan the right product mix based on store capacity
Shape stock distribution using customer insight and performance
Interpret options as a strategic lever, not only unit counts
Evaluate portfolios with the Boston Matrix
Build range plans from data, not intuition`,
    target_audience_en: `Planning, buying, and product management teams
Fashion and FMCG retail professionals
Design and R&D teams contributing to collections`,
  },
  {
    course_slug: "sgs",
    title_en: "Improve Days of Supply: Inventory Financing",
    subtitle_en:
      "Analyse excess stock by channel and category, then build a 90-day reduction plan using the Days of Inventory (DIO) framework.",
    description_md_en: `**Turkish subtitles.** This course connects product management with a financial view of inventory.

Most inventory programmes treat overstock as a supply-chain puzzle. This course treats it as what it really is—a **cash problem**. Every extra day of stock is money frozen on your balance sheet, costing you 20–30% per year whether it sells or not.

You will learn why inventory is frozen cash and how a single metric—**Days of Inventory (DIO)**—links finance language to the levers planners pull every week. You will calculate exactly how much cash a DIO reduction releases (in our worked example, cutting 31 days frees €6.3M with no extra sales).

Then comes the core skill: **never look at the total alone**. You will break DIO across four axes—channel, time, category, and age—and build a heat map that exposes the exact cell trapping your cash.

You will study the costly mistakes that build overstock in the first place—from managing the average, to delaying markdowns, to hiding forecast error inside healthy-looking totals—and how to avoid them.

### Who is this for?

- Retail planners and buyers managing seasonal inventory
- Finance and operations leaders who need a shared language with planning
- Category managers responsible for stock health and cash release

### By the end of this course you will be able to:

- Translate inventory days into cash impact
- Segment overstock by channel, month, and category
- Build a practical 90-day stock reduction plan
- Present inventory actions in language finance teams understand`,
    what_will_learn_en: `Connect DIO to cash release on the balance sheet
Build channel and category heat maps for overstock
Avoid the seven mistakes that create excess inventory
Create a 90-day stock reduction plan`,
    target_audience_en: `Retail planners and buyers
Finance and operations managers
Category managers focused on stock health`,
  },
  {
    course_slug: "aitools4planners",
    title_en: "AI-Powered Tools for Retail Planners and Buyers",
    subtitle_en:
      "Master AI-assisted demand forecasting, OTB planning, allocation, markdown management, and supplier collaboration.",
    description_md_en: `This course teaches how to use artificial intelligence in retail planning—comprehensively and hands-on.

Retail planning still runs largely on spreadsheets, gut feel, and end-of-season surprises. AI changes that fundamentally.

Retail planners, buyers, and merchandising professionals will learn to use tools such as **Claude, ChatGPT, and Microsoft Copilot** to make faster, smarter, and more accurate decisions across the planning cycle.

**No coding required. No data science background needed.** Only practical AI workflows designed for retail professionals.

### What you will learn

- Why AI is transforming retail planning and how it affects your role
- Build demand forecasts and spot seasonal patterns with AI prompts
- Use AI in **OTB (Open-to-Buy)** calculations, assortment mix analysis, and product decisions
- Score and prioritise allocation with AI logic
- Simulate markdown scenarios to protect gross margin with AI support
- Build a reusable prompt library and a weekly AI planning routine
- Develop category-specific AI strategies for fashion, hardlines, and perishables
- Strengthen supplier and supply-chain collaboration with AI
- Combine multiple AI models and build planning assistants for your organisation
- Prepare a 30-60-90 day AI adoption roadmap for your team

### Who is this for?

- Merchandise planners
- Retail buyers
- Allocation analysts
- Store operations managers
- Any retail professional who wants to work smarter with AI—without becoming a data scientist

### What you will have at the end

- A comprehensive AI prompt library
- A weekly AI-assisted planning workflow
- Category-based AI playbooks
- A clear roadmap to scale AI across your planning organisation`,
    what_will_learn_en: `Use AI prompts for demand forecasting and seasonality
Apply AI to OTB, assortment, and allocation decisions
Simulate markdown scenarios with AI support
Build a weekly AI planning routine and prompt library
Create a 30-60-90 day AI adoption roadmap`,
    target_audience_en: `Merchandise planners and retail buyers
Allocation analysts and store operations managers
Retail professionals adopting AI without a data science background`,
  },
];
