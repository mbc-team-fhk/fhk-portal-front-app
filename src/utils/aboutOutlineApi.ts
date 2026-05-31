export type AboutSectionItem = {
    text: string;
    type: "SECTION";
    notionLink: string;
};

export type AboutDropdownItem = {
    text: string;
    type: "DROPDOWN";
    subSectionItems: AboutSectionItem[];
};

export type AboutSectionGroup = {
    sectionGroup: {
        title: string;
        sectionItems: Array<AboutSectionItem | AboutDropdownItem>;
    };
};

type AboutOutlineRow = {
    active: string;
    groupTitle: string;
    itemType: string;
    itemText: string;
    parentText: string;
    notionEmbedLink?: string;
    notionLink?: string;
};

const ABOUT_OUTLINE_CSV_URL =
    "https://docs.google.com/spreadsheets/d/1svvkcCRCMFvjS2ZQjml-l_Jcygo0mcWtfoFZN5F-Zk0/export?format=csv&gid=0";

const activeValues = new Set(["true", "y", "yes", "1", "on", "활성"]);

function parseCsv(csv: string): string[][] {
    const rows: string[][] = [];
    let row: string[] = [];
    let cell = "";
    let inQuotes = false;

    for (let index = 0; index < csv.length; index += 1) {
        const char = csv[index];
        const nextChar = csv[index + 1];

        if (char === "\"") {
            if (inQuotes && nextChar === "\"") {
                cell += "\"";
                index += 1;
            } else {
                inQuotes = !inQuotes;
            }
            continue;
        }

        if (char === "," && !inQuotes) {
            row.push(cell);
            cell = "";
            continue;
        }

        if ((char === "\n" || char === "\r") && !inQuotes) {
            if (char === "\r" && nextChar === "\n") {
                index += 1;
            }
            row.push(cell);
            rows.push(row);
            row = [];
            cell = "";
            continue;
        }

        cell += char;
    }

    if (cell || row.length > 0) {
        row.push(cell);
        rows.push(row);
    }

    return rows;
}

function parseOutlineRows(csv: string): AboutOutlineRow[] {
    const [headerRow, ...dataRows] = parseCsv(csv);
    if (!headerRow) return [];

    const headers = headerRow.map((header) => header.trim());

    return dataRows.map((dataRow) =>
        Object.fromEntries(
            headers.map((header, index) => [header, (dataRow[index] ?? "").trim()]),
        ) as AboutOutlineRow,
    );
}

function isActive(value: string) {
    return activeValues.has(value.trim().toLowerCase());
}

function getOrCreateGroup(groups: AboutSectionGroup[], title: string) {
    let group = groups.find((candidate) => candidate.sectionGroup.title === title);

    if (!group) {
        group = {
            sectionGroup: {
                title,
                sectionItems: [],
            },
        };
        groups.push(group);
    }

    return group;
}

function findDropdown(group: AboutSectionGroup, text: string) {
    return group.sectionGroup.sectionItems.find(
        (item): item is AboutDropdownItem => item.type === "DROPDOWN" && item.text === text,
    );
}

function rowsToSectionGroups(rows: AboutOutlineRow[]): AboutSectionGroup[] {
    const groups: AboutSectionGroup[] = [];
    const activeRows = rows.filter((row) => isActive(row.active) && row.groupTitle && row.itemType && row.itemText);
    const activeDropdownIds = new Set(
        activeRows
            .filter((row) => row.itemType === "DROPDOWN")
            .map((row) => `${row.groupTitle}::${row.itemText}`),
    );

    activeRows.forEach((row) => {
        const group = getOrCreateGroup(groups, row.groupTitle);
        const itemType = row.itemType.trim().toUpperCase();

        if (itemType === "DROPDOWN") {
            if (!findDropdown(group, row.itemText)) {
                group.sectionGroup.sectionItems.push({
                    text: row.itemText,
                    type: "DROPDOWN",
                    subSectionItems: [],
                });
            }
            return;
        }

        if (itemType !== "SECTION") return;

        const section: AboutSectionItem = {
            text: row.itemText,
            type: "SECTION",
            notionLink: row.notionEmbedLink || row.notionLink || "",
        };

        if (!row.parentText) {
            group.sectionGroup.sectionItems.push(section);
            return;
        }

        if (!activeDropdownIds.has(`${row.groupTitle}::${row.parentText}`)) return;

        const dropdown = findDropdown(group, row.parentText);
        if (dropdown) {
            dropdown.subSectionItems.push(section);
        }
    });

    return groups
        .map((group) => ({
            sectionGroup: {
                ...group.sectionGroup,
                sectionItems: group.sectionGroup.sectionItems.filter(
                    (item) => item.type === "SECTION" || item.subSectionItems.length > 0,
                ),
            },
        }))
        .filter((group) => group.sectionGroup.sectionItems.length > 0);
}

export async function fetchAboutOutlineGroups(): Promise<AboutSectionGroup[]> {
    const response = await fetch(ABOUT_OUTLINE_CSV_URL);

    if (!response.ok) {
        throw new Error(`Failed to load about outline: HTTP ${response.status}`);
    }

    const csv = await response.text();
    const groups = rowsToSectionGroups(parseOutlineRows(csv));

    if (groups.length === 0) {
        throw new Error("Failed to load about outline: empty outline");
    }

    return groups;
}
