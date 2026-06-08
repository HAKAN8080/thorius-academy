import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import type { CertificateData } from "@/lib/certificate/types";
import { formatCertificateDate } from "@/lib/certificate/format-date";

const NAVY = "#0B1E3F";
const GOLD = "#D4AF37";
const PAGE_WIDTH = 842;
const PAGE_HEIGHT = 595;
const OUTER_MARGIN = 15;
const OUTER_BORDER = 3;
const INNER_MARGIN_FROM_PAGE = 22;
const INNER_BORDER = 1;
const CORNER_SIZE = 8;
const CORNER_OFFSET = CORNER_SIZE / 2;

const innerFrameMargin =
  INNER_MARGIN_FROM_PAGE - OUTER_MARGIN - OUTER_BORDER;

const styles = StyleSheet.create({
  page: {
    backgroundColor: NAVY,
    fontFamily: "Helvetica",
    width: PAGE_WIDTH,
    height: PAGE_HEIGHT,
  },
  outerBorder: {
    margin: OUTER_MARGIN,
    flex: 1,
    borderWidth: OUTER_BORDER,
    borderColor: GOLD,
    position: "relative",
  },
  cornerSquare: {
    position: "absolute",
    width: CORNER_SIZE,
    height: CORNER_SIZE,
    backgroundColor: GOLD,
  },
  cornerTopLeft: {
    top: -CORNER_OFFSET,
    left: -CORNER_OFFSET,
  },
  cornerTopRight: {
    top: -CORNER_OFFSET,
    right: -CORNER_OFFSET,
  },
  cornerBottomLeft: {
    bottom: -CORNER_OFFSET,
    left: -CORNER_OFFSET,
  },
  cornerBottomRight: {
    bottom: -CORNER_OFFSET,
    right: -CORNER_OFFSET,
  },
  innerBorder: {
    margin: innerFrameMargin,
    flex: 1,
    borderWidth: INNER_BORDER,
    borderColor: GOLD,
    paddingHorizontal: 48,
    paddingBottom: 36,
  },
  topSection: {
    paddingTop: 37,
    alignItems: "center",
  },
  brand: {
    fontSize: 28,
    fontWeight: 700,
    color: GOLD,
    textAlign: "center",
  },
  topDivider: {
    width: "100%",
    height: 1,
    backgroundColor: GOLD,
    marginTop: 16,
  },
  centerSection: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 24,
  },
  certificateTitle: {
    fontSize: 36,
    fontWeight: 700,
    color: "#FFFFFF",
    textAlign: "center",
    letterSpacing: 1,
  },
  centerSpacer: {
    height: 32,
  },
  certifyLead: {
    fontSize: 14,
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 12,
  },
  participantName: {
    fontSize: 24,
    fontWeight: 700,
    color: GOLD,
    textAlign: "center",
    marginBottom: 12,
  },
  certifyFollow: {
    fontSize: 14,
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 12,
  },
  courseName: {
    fontSize: 20,
    fontWeight: 700,
    fontStyle: "italic",
    color: "#FFFFFF",
    textAlign: "center",
    maxWidth: 620,
  },
  bottomSection: {
    borderTopWidth: 1,
    borderTopColor: GOLD,
    paddingTop: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  completionDate: {
    fontSize: 12,
    color: "#FFFFFF",
  },
  companyName: {
    fontSize: 11,
    color: GOLD,
    textAlign: "right",
    maxWidth: 280,
  },
});

function CornerDecorations() {
  return (
    <>
      <View style={[styles.cornerSquare, styles.cornerTopLeft]} />
      <View style={[styles.cornerSquare, styles.cornerTopRight]} />
      <View style={[styles.cornerSquare, styles.cornerBottomLeft]} />
      <View style={[styles.cornerSquare, styles.cornerBottomRight]} />
    </>
  );
}

export function CertificateDocument({ data }: { data: CertificateData }) {
  const formattedDate = formatCertificateDate(data.completionDate);

  return (
    <Document>
      <Page size={[PAGE_WIDTH, PAGE_HEIGHT]} style={styles.page}>
        <View style={styles.outerBorder}>
          <CornerDecorations />

          <View style={styles.innerBorder}>
            <View style={styles.topSection}>
              <Text style={styles.brand}>THORIUS ACADEMY</Text>
              <View style={styles.topDivider} />
            </View>

            <View style={styles.centerSection}>
              <Text style={styles.certificateTitle}>
                CERTIFICATE OF PARTICIPATION
              </Text>
              <View style={styles.centerSpacer} />
              <Text style={styles.certifyLead}>This is to certify that</Text>
              <Text style={styles.participantName}>{data.fullName}</Text>
              <Text style={styles.certifyFollow}>
                has successfully completed the course
              </Text>
              <Text style={styles.courseName}>{data.courseTitle}</Text>
            </View>

            <View style={styles.bottomSection}>
              <Text style={styles.completionDate}>
                Date of Completion: {formattedDate}
              </Text>
              <Text style={styles.companyName}>
                Thorius Eğitim ve Danışmanlık Ltd. Şti.
              </Text>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
}
