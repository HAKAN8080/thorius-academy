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

const styles = StyleSheet.create({
  page: {
    backgroundColor: "#FFFFFF",
    padding: 48,
    fontFamily: "Helvetica",
  },
  outerBorder: {
    flex: 1,
    borderWidth: 3,
    borderColor: NAVY,
    padding: 6,
  },
  innerBorder: {
    flex: 1,
    borderWidth: 1,
    borderColor: GOLD,
    padding: 40,
    justifyContent: "space-between",
  },
  header: {
    alignItems: "center",
    marginBottom: 24,
  },
  brand: {
    fontSize: 14,
    color: GOLD,
    letterSpacing: 4,
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 700,
    color: NAVY,
    letterSpacing: 3,
    textAlign: "center",
  },
  divider: {
    width: 120,
    height: 3,
    backgroundColor: GOLD,
    marginTop: 16,
    alignSelf: "center",
  },
  body: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  bodyText: {
    fontSize: 18,
    color: NAVY,
    lineHeight: 1.8,
    textAlign: "center",
  },
  emphasis: {
    fontWeight: 700,
    color: NAVY,
  },
  dateBlock: {
    alignItems: "center",
    marginTop: 32,
  },
  dateLabel: {
    fontSize: 12,
    color: GOLD,
    letterSpacing: 2,
    marginBottom: 6,
  },
  dateValue: {
    fontSize: 16,
    color: NAVY,
    fontWeight: 700,
  },
  footer: {
    alignItems: "center",
    marginTop: 24,
    borderTopWidth: 1,
    borderTopColor: GOLD,
    paddingTop: 20,
  },
  footerText: {
    fontSize: 12,
    color: NAVY,
    textAlign: "center",
  },
});

export function CertificateDocument({ data }: { data: CertificateData }) {
  const formattedDate = formatCertificateDate(data.completionDate);

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <View style={styles.outerBorder}>
          <View style={styles.innerBorder}>
            <View style={styles.header}>
              <Text style={styles.brand}>THORIUS ACADEMY</Text>
              <Text style={styles.title}>KATILIM BELGESİ</Text>
              <View style={styles.divider} />
            </View>

            <View style={styles.body}>
              <Text style={styles.bodyText}>
                <Text style={styles.emphasis}>{data.fullName}</Text> adlı katılımcı{" "}
                <Text style={styles.emphasis}>{data.courseTitle}</Text> eğitimine
                katılmıştır.
              </Text>

              <View style={styles.dateBlock}>
                <Text style={styles.dateLabel}>TARİH</Text>
                <Text style={styles.dateValue}>{formattedDate}</Text>
              </View>
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>
                Thorius Eğitim ve Danışmanlık Ltd. Şti.
              </Text>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
}
